"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { projects, environments } from "@/db/schema";
import { validateProjectInput, validateEnvironmentInput } from "@/domain/validation";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export async function createProjectAction(formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    key: formData.get("key") as string,
    description: formData.get("description") as string,
    repoUrl: formData.get("repoUrl") as string,
  };

  const validation = validateProjectInput(rawData);
  if (!validation.success || !validation.data) {
    const errorMsg = encodeURIComponent(Object.values(validation.errors || {}).join("; "));
    redirect(`/?error=${errorMsg}`);
  }

  const { name, key, description, repoUrl } = validation.data;

  // Cek apakah key sudah ada
  const existing = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.key, key))
    .limit(1);

  if (existing.length > 0) {
    redirect(`/?error=${encodeURIComponent(`Project key "${key}" is already taken.`)}`);
  }

  const newId = crypto.randomUUID();
  await db.insert(projects).values({
    id: newId,
    key,
    name,
    description,
    repoUrl,
  });

  revalidatePath("/");
  redirect(`/projects/${newId}?created=true`);
}

export async function toggleArchiveProjectAction(projectId: string, archive: boolean) {
  await db
    .update(projects)
    .set({
      archivedAt: archive ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId));

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
}

export async function createEnvironmentAction(projectId: string, formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    baseUrl: formData.get("baseUrl") as string,
    description: formData.get("description") as string,
    notes: formData.get("notes") as string,
    isActive: formData.get("isActive") === "on",
    isProduction: formData.get("isProduction") === "on",
  };

  const validation = validateEnvironmentInput(rawData);
  if (!validation.success || !validation.data) {
    const errorMsg = encodeURIComponent(Object.values(validation.errors || {}).join("; "));
    redirect(`/projects/${projectId}?error=${errorMsg}`);
  }

  const newEnvId = crypto.randomUUID();
  await db.insert(environments).values({
    id: newEnvId,
    projectId,
    name: validation.data.name,
    baseUrl: validation.data.baseUrl,
    description: validation.data.description,
    notes: validation.data.notes,
    isActive: validation.data.isActive,
    isProduction: validation.data.isProduction,
  });

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}?envCreated=true`);
}

export async function toggleEnvironmentStatusAction(projectId: string, envId: string, currentActive: boolean) {
  await db
    .update(environments)
    .set({
      isActive: !currentActive,
      updatedAt: new Date(),
    })
    .where(and(eq(environments.id, envId), eq(environments.projectId, projectId)));

  revalidatePath(`/projects/${projectId}`);
}
