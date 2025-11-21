"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Flame, ShoppingCart, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function StorePage() {
  const [items, setItems] = useState<any[]>([]);
  const [owned, setOwned] = useState<number[]>([]);
  const [equipped, setEquipped] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  async function refresh() {
    const res = await fetch("/api/store/items");
    const data = await res.json();
    setItems(data.items);
    setOwned(data.owned);
    setEquipped(data.equipped);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleBuyItem(itemId: number) {
    const res = await fetch("/api/store/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast({
        title: "Purchase Failed",
        description: data.error,
        className: "bg-red-600 text-white",
      });
      return;
    }

    toast({
      title: "Item Purchased 🎉",
      description: "You now own this item!",
      className: "bg-green-600 text-white",
    });

    refresh();
  }

  async function handleEquip(item: any) {
    const res = await fetch("/api/store/equip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast({
        title: "Equip Failed",
        description: data.error,
        className: "bg-red-600 text-white",
      });
      return;
    }

    toast({
      title: "Equipped 🎉",
      description: `${item.name} equipped successfully!`,
      className: "bg-blue-600 text-white",
    });

    refresh();
  }

  async function handleUnequip(item: any) {
    const res = await fetch("/api/store/unequip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: item.type }),
    });

    toast({
      title: "Unequipped",
      description: `${item.name} removed.`,
      className: "bg-zinc-700 text-white",
    });

    refresh();
  }

  return (
    <main className="px-4 sm:px-6 lg:px-10 py-24 text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
          <Flame className="text-orange-500" />
          Arise Store
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const isOwned = owned.includes(item.id);
            const isEquipped = equipped[item.type] === item.id;

            return (
              <div
                key={item.id}
                className={`bg-zinc-900 border rounded-xl p-4 flex flex-col items-center shadow transition ${isEquipped ? "border-blue-500 shadow-blue-500/30" : "border-zinc-800"
                  }`}
              >
                <div className="w-24 h-24 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                  <Image src={item.image} alt={item.name} width={100} height={100} />
                </div>

                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-sm text-zinc-400 capitalize">{item.type.toLowerCase()}</p>

                <p className="font-bold text-orange-400 mt-2 mb-4">{item.price} XP</p>

                {!isOwned ? (
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 w-full"
                    onClick={() => handleBuyItem(item.id)}
                  >
                    <ShoppingCart className="mr-2" size={16} />
                    Buy
                  </Button>
                ) : isEquipped ? (
                  <Button
                    className="bg-red-600 hover:bg-red-700 w-full"
                    onClick={() => handleUnequip(item)}
                  >
                    Unequip
                  </Button>

                ) : (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                    onClick={() => handleEquip(item)}
                  >
                    <Sparkles className="mr-2" size={16} />
                    Equip
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
