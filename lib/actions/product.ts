"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createProductSchema } from "@/lib/product/schemas";
import { ProductCatalogItem } from "@/lib/product/types";
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

export async function getProducts(): Promise<ProductCatalogItem[]> {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
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

  return products;
}

export async function createCustomProduct(
  name: string,
  type: "SOLUBLE" | "LIQUID"
): Promise<{ id: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Validate input
  const validated = createProductSchema.parse({ name, type });

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

  return product;
}