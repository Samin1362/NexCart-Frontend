'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { ICategory, ISpecification } from '@/types';

interface ProductForm {
  title: string;
  description: string;
  price: string;
  discountPrice: string;
  category: string;
  brand: string;
  stock: string;
  images: string[];
  tags: string;
  specifications: ISpecification[];
  isFeatured: boolean;
}

const defaultForm: ProductForm = {
  title: '',
  description: '',
  price: '',
  discountPrice: '',
  category: '',
  brand: '',
  stock: '',
  images: [''],
  tags: '',
  specifications: [],
  isFeatured: false,
};

function ProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.data || []);
      } catch {
        // ignore
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!editId) return;
    const fetchProduct = async () => {
      setLoadingProduct(true);
      try {
        // Fetch by ID - need to get by slug but we have id. Use products list with search
        const { data } = await api.get(`/products?limit=100`);
        const products = data.data || [];
        const product = products.find((p: { _id: string }) => p._id === editId);
        if (product) {
          const cat = typeof product.category === 'object' ? product.category._id : product.category;
          setForm({
            title: product.title || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            discountPrice: product.discountPrice?.toString() || '0',
            category: cat || '',
            brand: product.brand || '',
            stock: product.stock?.toString() || '',
            images: product.images?.length > 0 ? product.images : [''],
            tags: product.tags?.join(', ') || '',
            specifications: product.specifications || [],
            isFeatured: product.isFeatured || false,
          });
        }
      } catch {
        // ignore
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProduct();
  }, [editId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.price || Number(form.price) <= 0) newErrors.price = 'Valid price is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.stock || Number(form.stock) < 0) newErrors.stock = 'Valid stock is required';
    if (Number(form.discountPrice) > 0 && Number(form.discountPrice) >= Number(form.price)) {
      newErrors.discountPrice = 'Discount must be less than price';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setMessage(null);

    const body = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      discountPrice: Number(form.discountPrice) || 0,
      category: form.category,
      brand: form.brand.trim(),
      stock: Number(form.stock),
      images: form.images.filter((img) => img.trim()),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      specifications: form.specifications.filter((s) => s.key.trim() && s.value.trim()),
      isFeatured: form.isFeatured,
    };

    try {
      if (editId) {
        await api.patch(`/products/${editId}`, body);
        setMessage({ type: 'success', text: 'Product updated successfully!' });
      } else {
        await api.post('/products', body);
        setMessage({ type: 'success', text: 'Product created successfully!' });
        setForm(defaultForm);
      }
      setTimeout(() => router.push('/dashboard/products'), 1000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save product.' });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!form.title.trim()) {
      setErrors((prev) => ({ ...prev, title: 'Enter a title first to generate description' }));
      return;
    }
    setGeneratingAI(true);
    try {
      const categoryName = categories.find((c) => c._id === form.category)?.name || '';
      const { data } = await api.post('/ai/generate-description', {
        title: form.title.trim(),
        category: categoryName,
      });
      setForm((prev) => ({ ...prev, description: data.data?.description || data.data || prev.description }));
    } catch {
      setMessage({ type: 'error', text: 'Failed to generate description. Try again.' });
    } finally {
      setGeneratingAI(false);
    }
  };

  const updateField = (field: keyof ProductForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined as unknown as string }));
  };

  const addImage = () => setForm((prev) => ({ ...prev, images: [...prev.images, ''] }));
  const removeImage = (index: number) => setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  const updateImage = (index: number, value: string) => {
    setForm((prev) => ({ ...prev, images: prev.images.map((img, i) => (i === index ? value : img)) }));
  };

  const addSpec = () => setForm((prev) => ({ ...prev, specifications: [...prev.specifications, { key: '', value: '' }] }));
  const removeSpec = (index: number) => setForm((prev) => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== index) }));
  const updateSpec = (index: number, field: 'key' | 'value', value: string) => {
    setForm((prev) => ({
      ...prev,
      specifications: prev.specifications.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  };

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-accent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/products" className="text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {editId ? 'Edit Product' : 'Add Product'}
          </h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            {editId ? 'Update product information.' : 'Create a new product listing.'}
          </p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 border p-3 text-sm ${message.type === 'success' ? 'border-success bg-success/5 text-success' : 'border-error bg-error/5 text-error'}`}>
          {message.text}
        </div>
      )}

      <div className="max-w-3xl space-y-6">
        {/* Basic Info */}
        <div className="border border-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Basic Information</h2>
          <Input label="Title" value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Product title" error={errors.title} />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-text-primary">Description</label>
              <button
                onClick={handleGenerateDescription}
                disabled={generatingAI}
                className="inline-flex items-center gap-1.5 text-xs text-primary-accent hover:underline cursor-pointer disabled:opacity-50"
              >
                {generatingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                Generate with AI
              </button>
            </div>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Product description..."
              rows={5}
              className={`w-full border bg-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-accent focus:outline-none resize-none ${errors.description ? 'border-error' : 'border-border'}`}
            />
            {errors.description && <p className="mt-1 text-xs text-error">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Category</label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className={`h-11 w-full border bg-bg px-3 text-sm text-text-primary focus:border-primary-accent focus:outline-none ${errors.category ? 'border-error' : 'border-border'}`}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-error">{errors.category}</p>}
            </div>
            <Input label="Brand" value={form.brand} onChange={(e) => updateField('brand', e.target.value)} placeholder="Brand name" />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="border border-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Pricing & Stock</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Price ($)" type="number" value={form.price} onChange={(e) => updateField('price', e.target.value)} placeholder="0.00" error={errors.price} />
            <Input label="Discount Price ($)" type="number" value={form.discountPrice} onChange={(e) => updateField('discountPrice', e.target.value)} placeholder="0.00" error={errors.discountPrice} />
            <Input label="Stock" type="number" value={form.stock} onChange={(e) => updateField('stock', e.target.value)} placeholder="0" error={errors.stock} />
          </div>
        </div>

        {/* Images */}
        <div className="border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Images</h2>
            <button onClick={addImage} className="inline-flex items-center gap-1 text-xs text-primary-accent hover:underline cursor-pointer">
              <Plus className="h-3 w-3" /> Add Image
            </button>
          </div>
          {form.images.map((img, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={img}
                onChange={(e) => updateImage(i, e.target.value)}
                placeholder="Image URL"
                className="h-11 flex-1 border border-border bg-bg px-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-accent focus:outline-none"
              />
              {form.images.length > 1 && (
                <button onClick={() => removeImage(i)} className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-error cursor-pointer">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="border border-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Tags</h2>
          <Input label="Tags (comma-separated)" value={form.tags} onChange={(e) => updateField('tags', e.target.value)} placeholder="electronics, gadgets, sale" />
        </div>

        {/* Specifications */}
        <div className="border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Specifications</h2>
            <button onClick={addSpec} className="inline-flex items-center gap-1 text-xs text-primary-accent hover:underline cursor-pointer">
              <Plus className="h-3 w-3" /> Add Specification
            </button>
          </div>
          {form.specifications.length === 0 && (
            <p className="text-sm text-text-secondary">No specifications added.</p>
          )}
          {form.specifications.map((spec, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={spec.key}
                onChange={(e) => updateSpec(i, 'key', e.target.value)}
                placeholder="Key (e.g., Weight)"
                className="h-11 flex-1 border border-border bg-bg px-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-accent focus:outline-none"
              />
              <input
                value={spec.value}
                onChange={(e) => updateSpec(i, 'value', e.target.value)}
                placeholder="Value (e.g., 500g)"
                className="h-11 flex-1 border border-border bg-bg px-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary-accent focus:outline-none"
              />
              <button onClick={() => removeSpec(i)} className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-error cursor-pointer shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Featured Toggle */}
        <div className="border border-border p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => updateField('isFeatured', e.target.checked)}
              className="h-4 w-4 accent-primary-accent"
            />
            <span className="text-sm font-medium text-text-primary">Featured Product</span>
          </label>
          <p className="mt-1 ml-7 text-xs text-text-secondary">Featured products appear on the homepage.</p>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button onClick={handleSubmit} loading={saving}>
            {editId ? 'Update Product' : 'Create Product'}
          </Button>
          <Link href="/dashboard/products">
            <Button variant="secondary">Cancel</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AddEditProductPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary-accent" /></div>}>
      <ProductFormContent />
    </Suspense>
  );
}
