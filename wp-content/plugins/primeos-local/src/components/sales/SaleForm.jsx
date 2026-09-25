// @ts-nocheck
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";

export default function SaleForm({ open, onClose, onSave, sale, products, customers, isLoading }) {
  const [form, setForm] = useState({
    customer_id: "",
    customer_name: "",
    products: [],
    total_amount: 0,
    currency: "USD",
    channel: "direct",
    status: "pending",
    payment_status: "pending",
    notes: ""
  });

  useEffect(() => {
    if (sale) {
      setForm(sale);
    } else {
      setForm({
        customer_id: "",
        customer_name: "",
        products: [],
        total_amount: 0,
        currency: "USD",
        channel: "direct",
        status: "pending",
        payment_status: "pending",
        notes: ""
      });
    }
  }, [sale, open]);

  const handleCustomerSelect = (customerId) => {
    const customer = customers?.find(c => c.id === customerId);
    setForm({
      ...form,
      customer_id: customerId,
      customer_name: customer?.name || ""
    });
  };

  const addProduct = () => {
    setForm({
      ...form,
      products: [...form.products, { product_id: "", product_name: "", quantity: 1, unit_price: 0, total: 0 }]
    });
  };

  const updateProduct = (index, field, value) => {
    const updated = [...form.products];
    updated[index][field] = value;

    if (field === "product_id") {
      const product = products?.find(p => p.id === value);
      if (product) {
        updated[index].product_name = product.name;
        updated[index].unit_price = product.price;
        updated[index].total = product.price * updated[index].quantity;
      }
    }

    if (field === "quantity") {
      updated[index].total = updated[index].unit_price * value;
    }

    const total = updated.reduce((sum, item) => sum + (item.total || 0), 0);
    setForm({ ...form, products: updated, total_amount: total });
  };

  const removeProduct = (index) => {
    const updated = form.products.filter((_, i) => i !== index);
    const total = updated.reduce((sum, item) => sum + (item.total || 0), 0);
    setForm({ ...form, products: updated, total_amount: total });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sale ? "Edit Sale" : "New Sale"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Customer</Label>
              <Select value={form.customer_id} onValueChange={handleCustomerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Or enter name</Label>
              <Input
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                placeholder="Customer name"
              />
            </div>
            <div>
              <Label>Channel</Label>
              <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                  <SelectItem value="direct">🤝 Direct</SelectItem>
                  <SelectItem value="website">🌐 Website</SelectItem>
                  <SelectItem value="phone">📞 Phone</SelectItem>
                  <SelectItem value="in_person">🏪 In Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Status</Label>
              <Select value={form.payment_status} onValueChange={(v) => setForm({ ...form, payment_status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Products</Label>
              <Button type="button" variant="outline" size="sm" onClick={addProduct}>
                <Plus className="w-4 h-4 mr-1" />
                Add Product
              </Button>
            </div>
            <div className="space-y-2">
              {form.products.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <Select
                    value={item.product_id}
                    onValueChange={(v) => updateProduct(idx, "product_id", v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.filter(p => p.status === "active").map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ${product.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateProduct(idx, "quantity", parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <span className="w-24 text-right font-medium">${item.total?.toLocaleString()}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeProduct(idx)}>
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg">
            <span className="font-semibold">Total Amount</span>
            <span className="text-2xl font-bold">${form.total_amount?.toLocaleString()}</span>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Order notes..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {sale ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
