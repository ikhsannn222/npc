import { useState, useEffect } from "react";
import { api, formatPrice } from "../lib/api";
import { Component, ComponentType } from "../types/component";
import {
  Cpu,
  MonitorPlay,
  HardDrive,
  CircuitBoard,
  Database,
  Zap,
  Box,
  Fan,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const COMPONENT_TYPES: ComponentType[] = [
  "CPU",
  "Motherboard",
  "GPU",
  "RAM",
  "Storage",
  "PSU",
  "Case",
  "Cooler",
];

interface SelectedComponents {
  [key: string]: Component | null;
}

export default function RacikPC() {
  const [components, setComponents] = useState<Component[]>([]);
  const [selected, setSelected] = useState<SelectedComponents>({
    CPU: null,
    Motherboard: null,
    GPU: null,
    RAM: null,
    Storage: null,
    PSU: null,
    Case: null,
    Cooler: null,
  });
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    loadComponents();
  }, []);

  useEffect(() => {
    const total = Object.values(selected).reduce(
      (sum, item) => sum + (item?.price || 0),
      0
    );
    setTotalPrice(total);
  }, [selected]);

  const loadComponents = async () => {
    const data = await api.getComponents();
    setComponents(data);
  };

  const handleSelect = (type: ComponentType, component: Component) => {
    setSelected((prev) => ({ ...prev, [type]: component }));
  };

  const getFilteredComponents = (type: ComponentType) => {
    return components.filter((c) => c.type === type);
  };

  const checkCompatibility = () => {
    const issues = [];
    if (selected.CPU && selected.Motherboard) {
      // Simple regex check for socket compatibility if specs contain socket info
      // This is a naive check; real world needs structured data
      const cpuSocket = selected.CPU.specs?.match(/LGA\s?\d+|AM\d/i)?.[0];
      const moboSocket =
        selected.Motherboard.specs?.match(/LGA\s?\d+|AM\d/i)?.[0];

      if (
        cpuSocket &&
        moboSocket &&
        cpuSocket.toUpperCase().replace(/\s/g, "") !==
          moboSocket.toUpperCase().replace(/\s/g, "")
      ) {
        issues.push(
          `Socket mismatch: CPU (${cpuSocket}) vs Motherboard (${moboSocket})`
        );
      }
    }
    return issues;
  };

  const issues = checkCompatibility();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Racik PC Impian
        </h1>
        <p className="text-slate-600 mb-8">
          Pilih komponen satu per satu untuk membangun PC custom Anda.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Selection Area */}
          <div className="lg:col-span-2 space-y-6">
            {COMPONENT_TYPES.map((type) => (
              <div
                key={type}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                  <h2 className="font-bold text-slate-700 flex items-center gap-2">
                    {type === "CPU" && <Cpu size={20} />}
                    {type === "GPU" && <MonitorPlay size={20} />}
                    {type === "Motherboard" && <CircuitBoard size={20} />}
                    {type === "RAM" && <HardDrive size={20} />}
                    {type === "Storage" && <Database size={20} />}
                    {type === "PSU" && <Zap size={20} />}
                    {type === "Case" && <Box size={20} />}
                    {type === "Cooler" && <Fan size={20} />}
                    {type}
                  </h2>
                  {selected[type] && (
                    <span className="text-sm font-medium text-blue-600">
                      {formatPrice(selected[type]!.price)}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  {selected[type] ? (
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <img
                          src={
                            selected[type]!.image_url ||
                            "https://via.placeholder.com/100"
                          }
                          alt={selected[type]!.name}
                          className="w-20 h-20 object-cover rounded-lg bg-slate-50"
                        />
                        <div>
                          <h3 className="font-bold text-slate-800">
                            {selected[type]!.name}
                          </h3>
                          <p className="text-sm text-slate-500 mb-1">
                            {selected[type]!.specs}
                          </p>
                          <a
                            href={selected[type]!.marketplace_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                          >
                            <ShoppingCart size={12} /> Link Pembelian
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setSelected((prev) => ({ ...prev, [type]: null }))
                        }
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Ganti
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {getFilteredComponents(type).map((component) => (
                        <div
                          key={component.id}
                          onClick={() => handleSelect(type, component)}
                          className="border border-slate-200 rounded-lg p-3 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all flex gap-3"
                        >
                          <img
                            src={
                              component.image_url ||
                              "https://via.placeholder.com/60"
                            }
                            alt={component.name}
                            className="w-16 h-16 object-cover rounded bg-slate-50"
                          />
                          <div>
                            <h4 className="font-semibold text-slate-700 text-sm line-clamp-1">
                              {component.name}
                            </h4>
                            <div className="text-blue-600 font-bold text-sm">
                              {formatPrice(component.price)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {getFilteredComponents(type).length === 0 && (
                        <div className="text-slate-400 text-sm italic py-2">
                          Tidak ada komponen tersedia.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                Ringkasan Rakitan
              </h2>

              <div className="space-y-4 mb-6">
                {issues.length > 0 ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h3 className="text-red-800 font-semibold text-sm flex items-center gap-2 mb-2">
                      <AlertCircle size={16} /> Isu Kompatibilitas
                    </h3>
                    <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
                      {issues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  Object.values(selected).some((x) => x) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 text-sm">
                      <CheckCircle2 size={16} /> Komponen terlihat aman
                    </div>
                  )
                )}

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-600 font-medium">
                      Total Harga
                    </span>
                    <span className="text-3xl font-bold text-blue-600">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={issues.length > 0 || totalPrice === 0}
              >
                Simpan / Cetak Rakitan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
