"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { projects, environments, modules, features, testCases, testSteps } from "@/db/schema";
import {
  validateProjectInput,
  validateEnvironmentInput,
  validateModuleInput,
  validateFeatureInput,
  validateTestCaseInput,
  TestStepInput
} from "@/domain/validation";
import { eq, and, desc } from "drizzle-orm";
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
    redirect(`/projects/${projectId}?tab=environments&error=${errorMsg}`);
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
  redirect(`/projects/${projectId}?tab=environments&envCreated=true`);
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

export async function createModuleAction(projectId: string, formData: FormData) {
  const rawData = {
    name: formData.get("name") as string,
    code: formData.get("code") as string,
  };

  const validation = validateModuleInput(rawData);
  if (!validation.success || !validation.data) {
    const errorMsg = encodeURIComponent(Object.values(validation.errors || {}).join("; "));
    redirect(`/projects/${projectId}?tab=testcases&error=${errorMsg}`);
  }

  // Cek duplikasi code dalam project yang sama
  const existing = await db
    .select({ id: modules.id })
    .from(modules)
    .where(and(eq(modules.projectId, projectId), eq(modules.code, validation.data.code)))
    .limit(1);

  if (existing.length > 0) {
    redirect(`/projects/${projectId}?tab=testcases&error=${encodeURIComponent(`Module code "${validation.data.code}" already exists in this project.`)}`);
  }

  const newModId = crypto.randomUUID();
  await db.insert(modules).values({
    id: newModId,
    projectId,
    name: validation.data.name,
    code: validation.data.code,
  });

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}?tab=testcases&moduleCreated=true`);
}

export async function createFeatureAction(projectId: string, formData: FormData) {
  const rawData = {
    moduleId: formData.get("moduleId") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
  };

  const validation = validateFeatureInput(rawData);
  if (!validation.success || !validation.data) {
    const errorMsg = encodeURIComponent(Object.values(validation.errors || {}).join("; "));
    redirect(`/projects/${projectId}?tab=testcases&error=${errorMsg}`);
  }

  // Validasi kepemilikan parent module terhadap project
  const moduleOwner = await db
    .select({ id: modules.id })
    .from(modules)
    .where(and(eq(modules.id, validation.data.moduleId), eq(modules.projectId, projectId)))
    .limit(1);

  if (moduleOwner.length === 0) {
    redirect(`/projects/${projectId}?tab=testcases&error=${encodeURIComponent("Module does not belong to this project.")}`);
  }

  const newFeatId = crypto.randomUUID();
  await db.insert(features).values({
    id: newFeatId,
    moduleId: validation.data.moduleId,
    name: validation.data.name,
    description: validation.data.description,
  });

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}?tab=testcases&featureCreated=true`);
}

export async function createTestCaseAction(projectId: string, formData: FormData) {
  const featureId = formData.get("featureId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const preconditions = formData.get("preconditions") as string;
  const expectedResult = formData.get("expectedResult") as string;
  const priority = formData.get("priority") as any;
  const testType = formData.get("testType") as any;
  const tags = formData.get("tags") as string;

  // Kumpulkan dynamic step inputs
  const actionsList = formData.getAll("stepAction") as string[];
  const dataList = formData.getAll("stepData") as string[];
  const expectedList = formData.getAll("stepExpected") as string[];

  const steps: TestStepInput[] = [];
  for (let i = 0; i < actionsList.length; i++) {
    if (actionsList[i]?.trim()) {
      steps.push({
        stepNumber: i + 1,
        action: actionsList[i].trim(),
        testData: dataList[i]?.trim() || undefined,
        expectedResult: expectedList[i]?.trim() || undefined,
      });
    }
  }

  // Paksa status awal Draft dan automationState awal Manual
  const validation = validateTestCaseInput({
    featureId,
    title,
    description,
    preconditions,
    expectedResult,
    priority,
    testType,
    status: "Draft",
    automationState: "Manual",
    tags,
    steps,
  });

  if (!validation.success || !validation.data) {
    const errorMsg = encodeURIComponent(Object.values(validation.errors || {}).join("; "));
    redirect(`/projects/${projectId}?tab=testcases&error=${errorMsg}`);
  }

  // Validasi relasi feature -> module -> project
  const featureHierarchy = await db
    .select({
      featureId: features.id,
      moduleCode: modules.code,
      projectKey: projects.key,
    })
    .from(features)
    .innerJoin(modules, eq(features.moduleId, modules.id))
    .innerJoin(projects, eq(modules.projectId, projects.id))
    .where(and(eq(features.id, featureId), eq(projects.id, projectId)))
    .limit(1);

  if (featureHierarchy.length === 0) {
    redirect(`/projects/${projectId}?tab=testcases&error=${encodeURIComponent("Selected feature does not belong to this project.")}`);
  }

  const { projectKey, moduleCode } = featureHierarchy[0];
  const prefix = `${projectKey}-${moduleCode}`;

  let createdCode = "";

  // Jalankan penomoran dan penyimpanan secara atomik dalam transaksi
  await db.transaction(async (tx) => {
    // Ambil semua test case dalam project yang memiliki prefix yang sama
    const existing = await tx
      .select({ caseCode: testCases.caseCode })
      .from(testCases)
      .where(eq(testCases.projectId, projectId));

    let maxSuffix = 0;
    const prefixRegex = new RegExp(`^${prefix}-(\\d+)$`);
    for (const row of existing) {
      const match = row.caseCode.match(prefixRegex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSuffix) {
          maxSuffix = num;
        }
      }
    }

    const nextSuffix = maxSuffix + 1;
    createdCode = `${prefix}-${String(nextSuffix).padStart(3, "0")}`;

    const newCaseId = crypto.randomUUID();
    await tx.insert(testCases).values({
      id: newCaseId,
      projectId,
      featureId: validation.data!.featureId,
      caseCode: createdCode,
      title: validation.data!.title,
      description: validation.data!.description,
      preconditions: validation.data!.preconditions,
      expectedResult: validation.data!.expectedResult,
      priority: validation.data!.priority,
      testType: validation.data!.testType,
      status: "Draft",
      automationState: "Manual",
      tags: validation.data!.tags,
    });

    for (const step of validation.data!.steps) {
      await tx.insert(testSteps).values({
        id: crypto.randomUUID(),
        testCaseId: newCaseId,
        stepNumber: step.stepNumber,
        action: step.action,
        testData: step.testData,
        expectedResult: step.expectedResult,
      });
    }
  });

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}?tab=testcases&caseCreated=${encodeURIComponent(createdCode)}`);
}

export async function updateTestCaseStatusAction(projectId: string, caseId: string, newStatus: string) {
  const allowed = ["Draft", "Ready", "Deprecated"];
  if (!allowed.includes(newStatus)) {
    throw new Error("Invalid status transition.");
  }

  await db
    .update(testCases)
    .set({
      status: newStatus as "Draft" | "Ready" | "Deprecated",
      updatedAt: new Date(),
    })
    .where(and(eq(testCases.id, caseId), eq(testCases.projectId, projectId)));

  revalidatePath(`/projects/${projectId}`);
}

export async function updateTestCaseAutomationAction(projectId: string, caseId: string, newAutomation: string) {
  const allowed = ["Manual", "AI_Executable", "Automation_Candidate", "Automated"];
  if (!allowed.includes(newAutomation)) {
    throw new Error("Invalid automation state.");
  }

  await db
    .update(testCases)
    .set({
      automationState: newAutomation as "Manual" | "AI_Executable" | "Automation_Candidate" | "Automated",
      updatedAt: new Date(),
    })
    .where(and(eq(testCases.id, caseId), eq(testCases.projectId, projectId)));

  revalidatePath(`/projects/${projectId}`);
}
