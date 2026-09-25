// @ts-nocheck
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload } from "lucide-react";
import { primeos } from "@/api/primeosClient";

export default function ProductForm({ open, onClose, onSave, product, isLoading }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    sku: "",
    price: "",
    cost: "",
    currency: "USD",
    stock_quantity: 0,
    min_stock_level: 5,
    status: "active",
    image_url: "",
    whatsapp_enabled: true,
    whatsapp_message_template: ""
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setForm(product);
    } else {
      setForm({
        name: "",
        description: "",
        category: "",
        sku: "",
        price: "",
        cost: "",
        currency: "USD",
        stock_quantity: 0,
        min_stock_level: 5,
        status: "active",
        image_url: "",
        whatsapp_enabled: true,
        whatsapp_message_template: ""
      });
    }
  }, [product, open]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await primeos.integrations.Core.UploadFile({ file });
      setForm({ ...form, image_url: file_url });
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      price: parseFloat(form.price),
      cost: form.cost ? parseFloat(form.cost) : null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      min_stock_level: parseInt(form.min_stock_level) || 5
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Product name"
                required
              />
            </div>

            <div className="col-span-2">
              <Label>Image</Label>
              <div className="flex items-center gap-3">
                {form.image_url && (
                  <img src={form.image_url} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                )}
                <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span className="text-sm">{uploading ? "Uploading..." : "Upload image"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            <div>
              <Label>Price *</Label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label>Cost</Label>
              <Input
                type="number"
                step="0.01"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Product category"
              />
            </div>
            <div>
              <Label>SKU</Label>
              <Input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="SKU code"
              />
            </div>
            <div>
              <Label>Stock Quantity</Label>
              <Input
                type="number"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
              />
            </div>
            <div>
              <Label>Min Stock Level</Label>
              <Input
                type="number"
                value={form.min_stock_level}
                onChange={(e) => setForm({ ...form, min_stock_level: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.whatsapp_enabled}
                onCheckedChange={(v) => setForm({ ...form, whatsapp_enabled: v })}
              />
              <Label className="mb-0">WhatsApp Enabled</Label>
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Product description..."
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <Label>WhatsApp Message Template</Label>
              <Textarea
                value={form.whatsapp_message_template}
                onChange={(e) => setForm({ ...form, whatsapp_message_template: e.target.value })}
                placeholder="Hi! I'm interested in {product_name} at ${price}..."
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {product ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
