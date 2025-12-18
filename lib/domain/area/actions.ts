"use server";

import { auth } from "@/lib/core/auth/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/core/database";
import type { ActionResult } from "@/lib/shared/types";
import { revalidatePath } from "next/cache";
import type { CreateAreaInput, UpdateAreaInput } from "./schemas";
import { createAreaSchema, updateAreaSchema } from "./schemas";
import type { AreaListItem } from "./types";

/**
 * Get the current session or return null
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

export async function getAreas(): Promise<ActionResult<AreaListItem[]>> {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const areas = await prisma.area.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        type: true,
        sizeHa: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      data: areas,
    };
  } catch (error) {
    console.error("Error fetching areas:", error);
    return {
      success: false,
      error: "Failed to fetch areas",
    };
  }
}

export async function createArea(
  input: CreateAreaInput
): Promise<ActionResult<AreaListItem>> {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validatedInput = createAreaSchema.parse(input);

    const area = await prisma.area.create({
      data: {
        ...validatedInput,
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        type: true,
        sizeHa: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    revalidatePath("/dashboard/areas");

    return {
      success: true,
      data: area,
    };
  } catch (error) {
    console.error("Error creating area:", error);
    return {
      success: false,
      error: "Failed to create area",
    };
  }
}

export async function updateArea(
  input: UpdateAreaInput
): Promise<ActionResult<AreaListItem>> {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const validatedInput = updateAreaSchema.parse(input);

    // Check ownership
    const existingArea = await prisma.area.findUnique({
      where: {
        id: validatedInput.id,
      },
      select: {
        userId: true,
      },
    });

    if (!existingArea) {
      return {
        success: false,
        error: "Area not found",
      };
    }

    if (existingArea.userId !== session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const area = await prisma.area.update({
      where: {
        id: validatedInput.id,
      },
      data: {
        name: validatedInput.name,
        type: validatedInput.type,
        sizeHa: validatedInput.sizeHa,
      },
      select: {
        id: true,
        name: true,
        type: true,
        sizeHa: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    revalidatePath("/dashboard/areas");

    return {
      success: true,
      data: area,
    };
  } catch (error) {
    console.error("Error updating area:", error);
    return {
      success: false,
      error: "Failed to update area",
    };
  }
}

export async function deleteArea(id: string): Promise<ActionResult<void>> {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check ownership
    const existingArea = await prisma.area.findUnique({
      where: {
        id,
      },
      select: {
        userId: true,
        _count: {
          select: {
            applicationAreas: true,
          },
        },
      },
    });

    if (!existingArea) {
      return {
        success: false,
        error: "Area not found",
      };
    }

    if (existingArea.userId !== session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check if area is used in any applications
    if (existingArea._count.applicationAreas > 0) {
      return {
        success: false,
        error: `Cannot delete area. It is used in ${existingArea._count.applicationAreas} application(s)`,
      };
    }

    await prisma.area.delete({
      where: {
        id,
      },
    });

    revalidatePath("/dashboard/areas");

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Error deleting area:", error);
    return {
      success: false,
      error: "Failed to delete area",
    };
  }
}
