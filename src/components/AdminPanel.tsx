import { useEffect, useState } from "react";
import { api, formatPrice } from "../lib/api";
import { Component, ComponentType } from "../types/component";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { z, ZodIssue } from "zod";

/* =====================
   CONSTANTS
===================== */
const COMPONENT_TYPES = [
  "CPU",
  "GPU",
  "RAM",
  "Motherboard",
  "Storage",
  "PSU",
  "Case",
  "Cooler",
] as const;

/* =====================
   ZOD SCHEMA (v3 SAFE)
===================== */
const componentSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  type: z.enum(COMPONENT_TYPES),
  price: z.number().min(1000, "Harga minimal 1.000"),
  image_url: z.string().url("URL gambar tidak valid"),
  specs: z.string().optional(),
  description: z.string().optional(),
  marketplace_link: z
    .string()
    .url("Link marketplace tidak valid")
    .optional()
    .or(z.literal("")),
});

/* =====================
   DEBOUNCE HOOK
===================== */
function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

/* =====================
   MAIN COMPONENT
===================== */
export default function AdminPanel() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [filterType, setFilterType] = useState<ComponentType | "All">("All");

  const [formData, setFormData] = useState({
    name: "",
    type: "CPU" as ComponentType,
    price: 0,
    image_url: "",
    specs: "",
    description: "",
    marketplace_link: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const debouncedForm = useDebounce(formData);

  /* =====================
     FETCH DATA
  ===================== */
  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const data = await api.getComponents();
      setComponents(data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  /* =====================
     REALTIME VALIDATION
  ===================== */
  useEffect(() => {
    const result = componentSchema.safeParse(debouncedForm);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((issue: ZodIssue) => {
        const field = issue.path[0];
        if (typeof field === "string") {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);
    } else {
      setErrors({});
    }
  }, [debouncedForm]);

  /* =====================
     FORM ACTIONS
  ===================== */
  const resetForm = () => {
    setFormData({
      name: "",
      type: "CPU",
      price: 0,
      image_url: "",
      specs: "",
      description: "",
      marketplace_link: "",
    });
    setErrors({});
    setEditingId(null);
  };

  const openAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (c: Component) => {
    setFormData({
      name: c.name,
      type: c.type,
      price: c.price,
      image_url: c.image_url,
      specs: c.specs || "",
      description: c.description || "",
      marketplace_link: c.marketplace_link || "",
    });
    setEditingId(c.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    resetForm();
    setModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = componentSchema.safeParse(formData);
    if (!parsed.success) return;

    try {
      if (editingId) {
        await api.updateComponent(editingId, parsed.data);
      } else {
        await api.createComponent(parsed.data);
      }
      closeModal();
      fetchComponents();
    } catch (err) {
      alert("Gagal menyimpan data");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus komponen ini?")) return;
    try {
      await api.deleteComponent(id);
      fetchComponents();
    } catch (err) {
      alert("Gagal menghapus data");
    }
  };

  /* =====================
     DERIVED DATA
  ===================== */
  const filtered =
    filterType === "All"
      ? components
      : components.filter((c) => c.type === filterType);

  /* =====================
     UI
  ===================== */
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <button
            type="button"
            onClick={openAdd}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Tambah
          </button>
        </div>

        {/* FILTER */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["All", ...COMPONENT_TYPES].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t as any)}
              className={`px-4 py-2 rounded-lg ${
                filterType === t ? "bg-slate-700 text-white" : "bg-white border"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* LIST */}
        {!loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="bg-white border rounded-xl overflow-hidden shadow-sm"
              >
                <img
                  src={c.image_url}
                  alt={c.name}
                  className="aspect-video w-full object-cover"
                />
                <div className="p-4">
                  <span className="text-xs bg-slate-700 text-white px-2 py-1 rounded">
                    {c.type}
                  </span>
                  <h3 className="font-semibold mt-2">{c.name}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {c.specs}
                  </p>
                  <p className="text-blue-600 font-bold mt-2">
                    {formatPrice(c.price)}
                  </p>

                  <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="text-slate-600 hover:text-blue-600"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="text-slate-600 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center">Memuat...</p>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <Modal
          title={editingId ? "Edit Komponen" : "Tambah Komponen"}
          onClose={closeModal}
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-4 max-h-[80vh] overflow-y-auto px-1"
          >
            {/* NAMA */}
            <Input label="Nama" error={errors.name}>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Input>

            {/* TIPE */}
            <Input label="Tipe">
              <select
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as ComponentType,
                  })
                }
              >
                {COMPONENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Input>

            {/* HARGA */}
            <Input label="Harga" error={errors.price}>
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value === "" ? 0 : Number(e.target.value),
                  })
                }
              />
            </Input>

            {/* URL GAMBAR */}
            <Input label="URL Gambar" error={errors.image_url}>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    image_url: e.target.value,
                  })
                }
              />
            </Input>

            {/* SPESIFIKASI */}
            <Input label="Spesifikasi">
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                value={formData.specs}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specs: e.target.value,
                  })
                }
              />
            </Input>

            {/* DESKRIPSI */}
            <Input label="Deskripsi">
              <textarea
                rows={2}
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
              />
            </Input>

            {/* LINK MARKETPLACE */}
            <Input label="Link Marketplace" error={errors.marketplace_link}>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                value={formData.marketplace_link}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    marketplace_link: e.target.value,
                  })
                }
              />
            </Input>

            <button
              type="submit"
              disabled={Object.keys(errors).length > 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} /> Simpan
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* =====================
   REUSABLE UI
===================== */
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg relative max-h-full flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4"
        >
          <X />
        </button>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Input({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-medium text-sm text-slate-700 block mb-1">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
