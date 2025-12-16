"use server";

import { auth } from "@/lib/core/auth/server";
import { prisma } from "@/lib/core/database";
import { createProductSchema } from "@/lib/domain/product/schemas";
import type { ProductCatalogItem, CreateProductInput, ProductType } from "@/lib/domain/product/types";
import type { ActionResult } from "@/lib/shared/types";
import { headers } from "next/headers";

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

export async function getProducts(): Promise<ActionResult<ProductCatalogItem[]>> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { isPublic: true },
          { userId: session.user.id },
        ],
      },
      select: {
        id: true,
        name: true,
        type: true,
        isPublic: true,
      },
      orderBy: [
        { isPublic: "desc" }, // Public products first
        { name: "asc" },      // Then alphabetically
      ],
    });

    return { success: true, data: products };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch products",
    };
  }
}

export async function createCustomProduct(
  data: CreateProductInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const validated = createProductSchema.parse(data);

    const product = await prisma.product.create({
      data: {
        name: validated.name,
        type: validated.type,
        isPublic: false,
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    return { success: true, data: product };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create product",
    };
  }
}