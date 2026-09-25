// @ts-nocheck
import { useState } from "react";
import { primeos } from "@/api/primeosClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import EmptyState from "@/components/shared/EmptyState";
import ProductCard from "@/components/products/ProductCard";
import ProductForm from "@/components/products/ProductForm";
import SaleCard from "@/components/sales/SaleCard";
import SaleForm from "@/components/sales/SaleForm";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ShoppingCart, Package, TrendingUp, MessageCircle, Search, Plus, 
  Copy, ExternalLink
} from "lucide-react";
import { toast } from "sonner";

export default function Revenue() {
  const [activeTab, setActiveTab] = useState("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => primeos.entities.Product.list("-created_date")
  });

  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: () => primeos.entities.Sale.list("-created_date")
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => primeos.entities.Customer.list()
  });

  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: (data) => primeos.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowProductForm(false);
      setEditingProduct(null);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowProductForm(false);
      setEditingProduct(null);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => primeos.entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] })
  });

  // Sale mutations
  const createSaleMutation = useMutation({
    mutationFn: (data) => primeos.entities.Sale.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setShowSaleForm(false);
      setEditingSale(null);
    }
  });

  const updateSaleMutation = useMutation({
    mutationFn: ({ id, data }) => primeos.entities.Sale.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setShowSaleForm(false);
      setEditingSale(null);
    }
  });

  const handleSaveProduct = (data) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleSaveSale = (data) => {
    if (editingSale) {
      updateSaleMutation.mutate({ id: editingSale.id, data });
    } else {
      createSaleMutation.mutate(data);
    }
  };

  const handleSaleStatusChange = (sale, newStatus) => {
    updateSaleMutation.mutate({
      id: sale.id,
      data: { ...sale, status: newStatus }
    });
  };

  const handleWhatsAppShare = (product) => {
    setSelectedProduct(product);
    setShowWhatsAppModal(true);
  };

  const getWhatsAppMessage = (product) => {
    if (product.whatsapp_message_template) {
      return product.whatsapp_message_template
        .replace("{product_name}", product.name)
        .replace("{price}", product.price);
    }
    return `Hi! I'm interested in ${product.name} at $${product.price}. Is it available?`;
  };

  const copyWhatsAppLink = (product) => {
    const message = encodeURIComponent(getWhatsAppMessage(product));
    const link = `https://wa.me/?text=${message}`;
    navigator.clipboard.writeText(link);
    toast.success("WhatsApp link copied!");
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.customer_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const whatsappRevenue = sales.filter(s => s.channel === "whatsapp").reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const activeProducts = products.filter(p => p.status === "active").length;
  const totalSales = sales.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Revenue Stream"
          subtitle="Manage products, catalog, and sales across channels"
          icon={ShoppingCart}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            icon={TrendingUp}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            title="WhatsApp Revenue"
            value={`$${whatsappRevenue.toLocaleString()}`}
            icon={MessageCircle}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <StatCard
            title="Active Products"
            value={activeProducts}
            icon={Package}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />
          <StatCard
            title="Total Sales"
            value={totalSales}
            icon={ShoppingCart}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="products">Products & Catalog</TabsTrigger>
              <TabsTrigger value="sales">Sales & Orders</TabsTrigger>
            </TabsList>
            <Button
              onClick={() => activeTab === "products" ? setShowProductForm(true) : setShowSaleForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {activeTab === "products" ? "Product" : "Sale"}
            </Button>
          </div>

          <TabsContent value="products">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={(p) => {
                        setEditingProduct(p);
                        setShowProductForm(true);
                      }}
                      onDelete={(p) => deleteProductMutation.mutate(p.id)}
                      onWhatsAppShare={handleWhatsAppShare}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="No products yet"
                description="Add your products to start selling on WhatsApp and other channels."
                actionLabel="Add Product"
                onAction={() => setShowProductForm(true)}
              />
            )}
          </TabsContent>

          <TabsContent value="sales">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search sales..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sales Grid */}
            {filteredSales.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredSales.map((sale) => (
                    <SaleCard
                      key={sale.id}
                      sale={sale}
                      onEdit={(s) => {
                        setEditingSale(s);
                        setShowSaleForm(true);
                      }}
                      onDelete={(s) => updateSaleMutation.mutate({ id: s.id, data: { ...s, status: "cancelled" } })}
                      onStatusChange={handleSaleStatusChange}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState
                icon={ShoppingCart}
                title="No sales yet"
                description="Your sales from WhatsApp and other channels will appear here."
                actionLabel="Add Sale"
                onAction={() => setShowSaleForm(true)}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Forms */}
        <ProductForm
          open={showProductForm}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
          product={editingProduct}
          isLoading={createProductMutation.isPending || updateProductMutation.isPending}
        />

        <SaleForm
          open={showSaleForm}
          onClose={() => {
            setShowSaleForm(false);
            setEditingSale(null);
          }}
          onSave={handleSaveSale}
          sale={editingSale}
          products={products}
          customers={customers}
          isLoading={createSaleMutation.isPending || updateSaleMutation.isPending}
        />

        {/* WhatsApp Share Modal */}
        <Dialog open={showWhatsAppModal} onOpenChange={setShowWhatsAppModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                Share on WhatsApp
              </DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-2">Message Preview:</p>
                  <p className="text-slate-900">{getWhatsAppMessage(selectedProduct)}</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => copyWhatsAppLink(selectedProduct)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(getWhatsAppMessage(selectedProduct))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
