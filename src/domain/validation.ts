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

export interface ModuleInput {
  name: string;
  code: string;
  orderIndex?: number;
}

export interface FeatureInput {
  moduleId: string;
  name: string;
  description?: string;
  orderIndex?: number;
}

export interface TestStepInput {
  stepNumber: number;
  action: string;
  testData?: string;
  expectedResult?: string;
}

export interface TestCaseInput {
  featureId: string;
  title: string;
  description?: string;
  preconditions?: string;
  expectedResult: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  testType: "Functional" | "Regression" | "Negative" | "Boundary" | "Validation" | "State" | "Permission";
  status: "Draft" | "Ready" | "Deprecated";
  automationState: "Manual" | "AI_Executable" | "Automation_Candidate" | "Automated";
  tags?: string;
  steps: TestStepInput[];
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

export function validateModuleInput(input: Partial<ModuleInput>): ValidationResult<ModuleInput> {
  const errors: Record<string, string> = {};

  const name = input.name?.trim() || "";
  if (!name) {
    errors.name = "Module name is required.";
  } else if (name.length < 2 || name.length > 50) {
    errors.name = "Module name must be between 2 and 50 characters.";
  }

  const rawCode = input.code?.trim().toUpperCase() || "";
  if (!rawCode) {
    errors.code = "Module code is required (e.g. AUTH, CHAT, BILL).";
  } else if (!/^[A-Z0-9_-]{2,8}$/.test(rawCode)) {
    errors.code = "Module code must be 2-8 uppercase alphanumeric characters.";
  }

  const orderIndex = typeof input.orderIndex === "number" ? input.orderIndex : 0;

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name,
      code: rawCode,
      orderIndex,
    },
  };
}

export function validateFeatureInput(input: Partial<FeatureInput>): ValidationResult<FeatureInput> {
  const errors: Record<string, string> = {};

  const moduleId = input.moduleId?.trim() || "";
  if (!moduleId) {
    errors.moduleId = "Parent module is required.";
  }

  const name = input.name?.trim() || "";
  if (!name) {
    errors.name = "Feature name is required.";
  } else if (name.length < 2 || name.length > 80) {
    errors.name = "Feature name must be between 2 and 80 characters.";
  }

  const description = input.description?.trim() || undefined;
  const orderIndex = typeof input.orderIndex === "number" ? input.orderIndex : 0;

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      moduleId,
      name,
      description,
      orderIndex,
    },
  };
}

export function validateTestCaseInput(input: Partial<TestCaseInput>): ValidationResult<TestCaseInput> {
  const errors: Record<string, string> = {};

  const featureId = input.featureId?.trim() || "";
  if (!featureId) {
    errors.featureId = "Feature assignment is required.";
  }

  const title = input.title?.trim() || "";
  if (!title) {
    errors.title = "Test case title is required.";
  } else if (title.length < 4 || title.length > 150) {
    errors.title = "Title must be between 4 and 150 characters.";
  }

  const expectedResult = input.expectedResult?.trim() || "";
  if (!expectedResult) {
    errors.expectedResult = "Expected result is required.";
  }

  const validPriorities = ["Critical", "High", "Medium", "Low"] as const;
  const priority = input.priority && validPriorities.includes(input.priority) ? input.priority : "Medium";

  const validTestTypes = ["Functional", "Regression", "Negative", "Boundary", "Validation", "State", "Permission"] as const;
  const testType = input.testType && validTestTypes.includes(input.testType) ? input.testType : "Functional";

  const validStatuses = ["Draft", "Ready", "Deprecated"] as const;
  const status = input.status && validStatuses.includes(input.status) ? input.status : "Draft";

  const validAutomation = ["Manual", "AI_Executable", "Automation_Candidate", "Automated"] as const;
  const automationState = input.automationState && validAutomation.includes(input.automationState) ? input.automationState : "Manual";

  const description = input.description?.trim() || undefined;
  const preconditions = input.preconditions?.trim() || undefined;
  const tags = input.tags?.trim() || undefined;

  const rawSteps = input.steps || [];
  const steps: TestStepInput[] = [];

  for (let i = 0; i < rawSteps.length; i++) {
    const s = rawSteps[i];
    const action = s.action?.trim();
    if (action) {
      steps.push({
        stepNumber: i + 1,
        action,
        testData: s.testData?.trim() || undefined,
        expectedResult: s.expectedResult?.trim() || undefined,
      });
    }
  }

  if (steps.length === 0) {
    errors.steps = "At least one test step with an action is required.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      featureId,
      title,
      description,
      preconditions,
      expectedResult,
      priority,
      testType,
      status,
      automationState,
      tags,
      steps,
    },
  };
}
