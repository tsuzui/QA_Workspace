export interface ProjectInput {
  name: string;
  key: string;
  description?: string;
  repoUrl?: string;
}

export interface EnvironmentInput {
  name: string;
  baseUrl: string;
  description?: string;
  isActive?: boolean;
  isProduction?: boolean;
  notes?: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

export function validateProjectInput(input: Partial<ProjectInput>): ValidationResult<ProjectInput> {
  const errors: Record<string, string> = {};

  const name = input.name?.trim() || "";
  if (!name) {
    errors.name = "Project name is required.";
  } else if (name.length < 2 || name.length > 100) {
    errors.name = "Project name must be between 2 and 100 characters.";
  }

  const rawKey = input.key?.trim().toUpperCase() || "";
  if (!rawKey) {
    errors.key = "Project key is required (e.g. WAVY).";
  } else if (!/^[A-Z0-9_-]{2,12}$/.test(rawKey)) {
    errors.key = "Project key must be 2-12 uppercase alphanumeric characters (hyphens and underscores allowed).";
  }

  let repoUrl: string | undefined = input.repoUrl?.trim();
  if (repoUrl) {
    try {
      const parsed = new URL(repoUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        errors.repoUrl = "Repository URL must use http: or https:.";
      }
    } catch {
      errors.repoUrl = "Invalid Repository URL format.";
    }
  } else {
    repoUrl = undefined;
  }

  const description = input.description?.trim() || undefined;

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name,
      key: rawKey,
      description,
      repoUrl,
    },
  };
}

export function validateEnvironmentInput(input: Partial<EnvironmentInput>): ValidationResult<EnvironmentInput> {
  const errors: Record<string, string> = {};

  const name = input.name?.trim() || "";
  if (!name) {
    errors.name = "Environment name is required (e.g. Development, Staging, Production).";
  } else if (name.length < 2 || name.length > 50) {
    errors.name = "Environment name must be between 2 and 50 characters.";
  }

  const baseUrl = input.baseUrl?.trim() || "";
  if (!baseUrl) {
    errors.baseUrl = "Base URL is required.";
  } else {
    try {
      const parsed = new URL(baseUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        errors.baseUrl = "Base URL must use http: or https:.";
      }
    } catch {
      errors.baseUrl = "Invalid Base URL format. Must be a valid URL (e.g. http://localhost:3000 or https://dev.example.com).";
    }
  }

  const description = input.description?.trim() || undefined;
  const notes = input.notes?.trim() || undefined;
  const isActive = input.isActive !== undefined ? Boolean(input.isActive) : true;
  const isProduction = input.isProduction !== undefined ? Boolean(input.isProduction) : false;

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name,
      baseUrl,
      description,
      isActive,
      isProduction,
      notes,
    },
  };
}
