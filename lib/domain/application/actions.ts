"use server";

import { auth } from "@/lib/core/auth/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/core/database";
import { revalidatePath } from "next/cache";
import { createApplicationSchema } from "@/lib/domain/application/schemas";
import type {
  CreateApplicationInput,
  ScheduleApplicationInput,
  CompleteApplicationInput,
  ApplicationListItem,
  ApplicationWithAreas,
  ApplicationDetail,
  AreaType,
} from "@/lib/domain/application/types";
import { ApplicationStatus } from "@/lib/domain/application/types";
import type { ApplicationProductField, ProductType } from "@/lib/domain/product/types";
import { isCuid } from "@paralleldrive/cuid2";
import type { ActionResult } from "@/lib/shared/types";

/**
 * Get the current session or return an error
 */
async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return session;
}

/**
 * Validate that all product IDs exist and are accessible by the user
 */
async function validateProductIds(
  productIds: string[],
  userId: string
): Promise<{ valid: boolean; error?: string }> {
  if (productIds.length === 0) {
    return { valid: true };
  }

  // Check all product IDs are valid CUIDs
  const invalidIds = productIds.filter(id => !isCuid(id));
  if (invalidIds.length > 0) {
    return {
      valid: false,
      error: `Invalid product ID format: ${invalidIds.join(', ')}`
    };
  }

  // Verify all products exist and are accessible (public or owned by user)
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      OR: [
        { isPublic: true },
        { userId: userId },
      ],
    },
    select: {
      id: true,
    },
  });

  const foundIds = new Set(products.map(p => p.id));
  const missingIds = productIds.filter(id => !foundIds.has(id));

  if (missingIds.length > 0) {
    return {
      valid: false,
      error: `Products not found or not accessible: ${missingIds.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Create a new application
 */
export async function createApplication(
  data: CreateApplicationInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const validationResult = createApplicationSchema.safeParse(data);
    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((issue) => issue.message)
        .join(', ');

      return { success: false, error: `Invalid form data: ${errors}` };
    }

    const { name, nozzleId, sprayVolumeLHa, nozzleSpacingM, nozzleCount, tankSizeL, speedKmH, areas, products } = validationResult.data;

    // Validate all product IDs exist and are accessible
    const productIds = products.map(p => p.productId);
    const productValidation = await validateProductIds(productIds, session.user.id);
    if (!productValidation.valid) {
      return { success: false, error: productValidation.error || "Invalid products" };
    }

    // Create application with areas and products in a transaction
    const application = await prisma.application.create({
      data: {
        name,
        userId: session.user.id,
        nozzleId,
        sprayVolumeLHa,
        nozzleSpacingM,
        nozzleCount,
        tankSizeL,
        speedKmH,
        areas: {
          create: areas.map((area, index) => ({
            label: area.label,
            type: area.type,
            sizeHa: area.sizeHa,
            order: index,
          })),
        },
        applicationProducts: {
          create: products.map((product, index) => ({
            productId: product.productId,
            ratePerHa: product.ratePerHa,
            order: index,
          })),
        },
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: { id: application.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create application",
    };
  }
}

/**
 * Get all applications for the current user (with pagination and filtering)
 */
export async function getApplications(params?: {
  page?: number;
  pageSize?: number;
  status?: ApplicationStatus | "all";
}): Promise<ActionResult<{
  data: ApplicationListItem[];
  pageCount: number;
  totalCount: number;
}>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const page = params?.page ?? 0;
    const pageSize = params?.pageSize ?? 10;
    const status = params?.status ?? "all";

    // Build where clause
    const where = {
      userId: session.user.id,
      ...(status !== "all" && { status }),
    };

    // Execute count and findMany in a transaction for consistency
    const [totalCount, applications] = await prisma.$transaction([
      prisma.application.count({ where }),
      prisma.application.findMany({
        where,
        include: {
          areas: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: page * pageSize,
        take: pageSize,
      }),
    ]);

    const pageCount = Math.ceil(totalCount / pageSize);

    // Calculate total area for each application and format dates
    const applicationsWithTotalArea = applications.map((app) => ({
      id: app.id,
      name: app.name,
      status: app.status as ApplicationStatus,
      scheduledDate: app.scheduledDate,
      completedDate: app.completedDate,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      totalAreaHa: app.areas.reduce((sum, area) => sum + area.sizeHa, 0),
      formattedUpdatedAt: new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(app.updatedAt),
    }));

    return {
      success: true,
      data: {
        data: applicationsWithTotalArea,
        pageCount,
        totalCount,
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch applications",
    };
  }
}

/**
 * Get a single application by ID
 */
export async function getApplication(
  id: string
): Promise<ActionResult<ApplicationWithAreas>> {
  if (isCuid(id) === false) {
    return { success: false, error: "Invalid application ID" };
  }
  
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const application = await prisma.application.findFirst({
      where: {
        id,
        userId: session.user.id, // Row-level security
      },
      include: {
        areas: {
          orderBy: {
            order: "asc",
          },
        },
        applicationProducts: {
          include: {
            product: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!application) {
      return { success: false, error: "Application not found" };
    }

    return {
      success: true,
      data: {
        id: application.id,
        name: application.name,
        nozzleId: application.nozzleId,
        sprayVolumeLHa: application.sprayVolumeLHa,
        nozzleSpacingM: application.nozzleSpacingM,
        nozzleCount: application.nozzleCount,
        tankSizeL: application.tankSizeL,
        speedKmH: application.speedKmH,
        areas: application.areas.map((area) => ({
          label: area.label,
          type: area.type as AreaType,
          sizeHa: area.sizeHa,
        })),
        products: application.applicationProducts.map((ap) => ({
          productId: ap.productId,
          productName: ap.product.name,
          productType: ap.product.type as ProductType,
          ratePerHa: ap.ratePerHa,
        })),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch application",
    };
  }
}

/**
 * Update an existing application
 */
export async function updateApplication(
  id: string,
  data: CreateApplicationInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const validationResult = createApplicationSchema.safeParse(data);
    if (!validationResult.success) {
      return { success: false, error: "Invalid form data" };
    }

    // Check ownership
    const existing = await prisma.application.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return { success: false, error: "Application not found" };
    }

    const { name, nozzleId, sprayVolumeLHa, nozzleSpacingM, nozzleCount, tankSizeL, speedKmH, areas, products } = validationResult.data;

    // Validate all product IDs exist and are accessible
    const productIds = products.map(p => p.productId);
    const productValidation = await validateProductIds(productIds, session.user.id);
    if (!productValidation.valid) {
      return { success: false, error: productValidation.error || "Invalid products" };
    }

    // Update application and replace all areas and products in a transaction
    await prisma.$transaction([
      // Delete all existing areas
      prisma.applicationArea.deleteMany({
        where: {
          applicationId: id,
        },
      }),
      // Delete all existing products
      prisma.applicationProduct.deleteMany({
        where: {
          applicationId: id,
        },
      }),
      // Update application and create new areas and products
      prisma.application.update({
        where: {
          id,
        },
        data: {
          name,
          nozzleId,
          sprayVolumeLHa,
          nozzleSpacingM,
          nozzleCount,
          tankSizeL,
          speedKmH,
          areas: {
            create: areas.map((area, index) => ({
              label: area.label,
              type: area.type,
              sizeHa: area.sizeHa,
              order: index,
            })),
          },
          applicationProducts: {
            create: products.map((product, index) => ({
              productId: product.productId,
              ratePerHa: product.ratePerHa,
              order: index,
            })),
          },
        },
      }),
    ]);

    revalidatePath("/dashboard");
    revalidatePath(`/applications/${id}/edit`);
    return { success: true, data: { id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update application",
    };
  }
}

/**
 * Delete an application
 */
export async function deleteApplication(
  id: string
): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Check ownership before deleting
    const existing = await prisma.application.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return { success: false, error: "Application not found" };
    }

    // Delete application (areas will cascade)
    await prisma.application.delete({
      where: {
        id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete application",
    };
  }
}

/**
 * Schedule an application (DRAFT -> SCHEDULED)
 */
export async function scheduleApplication(
  id: string,
  data: ScheduleApplicationInput
): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const application = await prisma.application.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!application) {
      return { success: false, error: "Application not found" };
    }

    await prisma.application.update({
      where: { id },
      data: {
        status: ApplicationStatus.SCHEDULED,
        scheduledDate: new Date(data.scheduledDate),
        // Clear completion details if transitioning from COMPLETED
        completedDate: null,
        operator: null,
        weatherConditions: null,
        notes: null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/applications/${id}/edit`);
    revalidatePath(`/applications/${id}`);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to schedule application",
    };
  }
}

/**
 * Complete an application (DRAFT/SCHEDULED -> COMPLETED)
 */
export async function completeApplication(
  id: string,
  data: CompleteApplicationInput
): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const application = await prisma.application.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!application) {
      return { success: false, error: "Application not found" };
    }

    await prisma.application.update({
      where: { id },
      data: {
        status: ApplicationStatus.COMPLETED,
        completedDate: new Date(data.completedDate),
        operator: data.operator,
        weatherConditions: data.weatherConditions,
        notes: data.notes,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/applications/${id}/edit`);
    revalidatePath(`/applications/${id}`);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete application",
    };
  }
}

/**
 * Revert application status to DRAFT
 */
export async function revertToDraft(
  id: string
): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const application = await prisma.application.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!application) {
      return { success: false, error: "Application not found" };
    }

    await prisma.application.update({
      where: { id },
      data: {
        status: ApplicationStatus.DRAFT,
        scheduledDate: null,
        // Clear completion details if reverting from COMPLETED
        completedDate: null,
        operator: null,
        weatherConditions: null,
        notes: null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/applications/${id}/edit`);
    revalidatePath(`/applications/${id}`);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to revert application",
    };
  }
}

/**
 * Revert application status to SCHEDULED
 */
export async function revertToScheduled(
  id: string
): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const application = await prisma.application.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!application) {
      return { success: false, error: "Application not found" };
    }

    if (application.status !== ApplicationStatus.COMPLETED) {
      return { success: false, error: "Can only revert completed applications" };
    }

    await prisma.application.update({
      where: { id },
      data: {
        status: ApplicationStatus.SCHEDULED,
        completedDate: null,
        operator: null,
        weatherConditions: null,
        notes: null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/applications/${id}/edit`);
    revalidatePath(`/applications/${id}`);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to revert application",
    };
  }
}

/**
 * Get complete application details for the detail page
 */
export async function getApplicationDetail(
  id: string
): Promise<ActionResult<ApplicationDetail>> {
  if (isCuid(id) === false) {
    return { success: false, error: "Invalid application ID" };
  }

  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const application = await prisma.application.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        areas: {
          orderBy: {
            order: "asc",
          },
        },
        applicationProducts: {
          include: {
            product: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!application) {
      return { success: false, error: "Application not found" };
    }

    return {
      success: true,
      data: {
        id: application.id,
        name: application.name,
        status: application.status as ApplicationStatus,
        nozzleId: application.nozzleId,
        sprayVolumeLHa: application.sprayVolumeLHa,
        nozzleSpacingM: application.nozzleSpacingM,
        nozzleCount: application.nozzleCount,
        tankSizeL: application.tankSizeL,
        speedKmH: application.speedKmH,
        scheduledDate: application.scheduledDate,
        completedDate: application.completedDate,
        operator: application.operator,
        weatherConditions: application.weatherConditions,
        notes: application.notes,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        areas: application.areas.map((area) => ({
          label: area.label,
          type: area.type as AreaType,
          sizeHa: area.sizeHa,
        })),
        products: application.applicationProducts.map((ap) => ({
          productId: ap.productId,
          productName: ap.product.name,
          productType: ap.product.type as ProductType,
          ratePerHa: ap.ratePerHa,
        })),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch application detail",
    };
  }
}