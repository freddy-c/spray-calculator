"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProductType, PRODUCT_TYPE_LABELS, PRODUCT_TYPE_UNITS, type ProductCatalogItem } from "@/lib/domain/product/types";
import { productCatalogFilterSchema, type ProductCatalogFilterInput } from "@/lib/domain/product/schemas";
import { getProducts } from "@/lib/domain/product/actions";
import { CreateProductForm } from "./CreateProductForm";

interface ProductCatalogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductSelected: (product: ProductCatalogItem) => void;
}

export function ProductCatalogDialog({
  open,
  onOpenChange,
  onProductSelected,
}: ProductCatalogDialogProps) {
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { control, watch, reset } = useForm<ProductCatalogFilterInput>({
    resolver: zodResolver(productCatalogFilterSchema),
    defaultValues: {
      searchQuery: "",
      typeFilter: "all",
    },
  });

  const searchQuery = watch("searchQuery");
  const typeFilter = watch("typeFilter");

  // Load products when dialog opens
  useEffect(() => {
    if (open) {
      loadProducts();
      setShowCreateForm(false);
      reset();
    }
  }, [open, reset]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const result = await getProducts();
      if (result.success) {
        setProducts(result.data);
      } else {
        console.error("Failed to load products:", result.error);
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products client-side
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || product.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [products, searchQuery, typeFilter]);

  const handleProductCreated = (productId: string, productName: string, productType: ProductType) => {
    // Add the new product to the list
    const newProduct: ProductCatalogItem = {
      id: productId,
      name: productName,
      type: productType,
      isPublic: false,
    };
    setProducts((prev) => [...prev, newProduct]);

    // Auto-select the new product and close dialog
    onProductSelected(newProduct);
    onOpenChange(false);
  };

  const handleSelectProduct = (product: ProductCatalogItem) => {
    onProductSelected(product);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {showCreateForm ? "Create Custom Product" : "Select Product"}
          </DialogTitle>
          <DialogDescription>
            {showCreateForm
              ? "Create a new custom product for your account"
              : "Choose a product from the catalog or create a custom one"}
          </DialogDescription>
        </DialogHeader>

        {showCreateForm ? (
          <CreateProductForm
            onCancel={() => setShowCreateForm(false)}
            onProductCreated={handleProductCreated}
          />
        ) : (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2">
              <Controller
                name="searchQuery"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Search products..."
                    className="flex-1"
                  />
                )}
              />
              <Controller
                name="typeFilter"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value={ProductType.SOLUBLE}>
                        {PRODUCT_TYPE_LABELS[ProductType.SOLUBLE]}
                      </SelectItem>
                      <SelectItem value={ProductType.LIQUID}>
                        {PRODUCT_TYPE_LABELS[ProductType.LIQUID]}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Product list */}
            <div className="flex-1 overflow-y-auto border rounded-md">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading products...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No products found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 space-x-4 flex items-center justify-between hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{product.name}</p>
                          {product.isPublic ? (
                            <Badge variant="secondary">Public</Badge>
                          ) : (
                            <Badge variant="outline">Custom</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {PRODUCT_TYPE_LABELS[product.type]} ({PRODUCT_TYPE_UNITS[product.type]})
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSelectProduct(product)}
                      >
                        Select
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Create custom button */}
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(true)}
            >
              Create Custom Product
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}