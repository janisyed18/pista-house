import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CheckCircle2, HelpCircle, Info } from "lucide-react";

import { ALLERGEN_COLUMNS, ALLERGEN_STATUS_LABELS, type AllergenStatus, getAllergenRows } from "@/lib/allergens";
import { flattenMenu, getMergedMenu } from "@/lib/menu";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Allergen Matrix",
  description: "View the Pista House Wentworthville allergen matrix for menu items, including wheat, milk, egg, peanut, sesame, soy and other required allergen names.",
  alternates: { canonical: "/allergens" },
};

export const revalidate = 60;

const statusStyles: Record<AllergenStatus, string> = {
  contains: "border-burgundy-700 bg-burgundy-900 text-white",
  mayContain: "border-saffron-700/35 bg-saffron-100 text-burgundy-900",
  ask: "border-ink/20 bg-ink text-white",
  notDeclared: "border-black/8 bg-white text-charcoal/42",
};

const statusSymbols: Record<AllergenStatus, string> = {
  contains: "C",
  mayContain: "M",
  ask: "?",
  notDeclared: "-",
};

export default async function AllergensPage() {
  const menuCategories = await getMergedMenu();
  const rows = getAllergenRows(flattenMenu(menuCategories));
  const groupedRows = menuCategories
    .map((category) => ({
      category,
      rows: rows.filter((row) => row.categoryName === category.name),
    }))
    .filter((group) => group.rows.length > 0);

  return (
    <section className="bg-background py-12 md:py-18">
      <div className="container">
        <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="max-w-4xl">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-saffron-700">Allergen guide</p>
            <h1 className="font-display text-6xl font-bold leading-none text-ink md:text-8xl">Menu Allergen Matrix</h1>
            <p className="mt-5 text-lg leading-8 text-charcoal/72">
              This guide helps guests scan common allergens before ordering. Recipes, suppliers and kitchen handling can change, so guests with allergies must confirm with staff before placing an order.
            </p>
          </div>

          <aside className="rounded border border-burgundy-900/15 bg-white p-5 shadow-sm">
            <div className="flex gap-3">
              <AlertTriangle aria-hidden className="mt-1 h-5 w-5 shrink-0 text-burgundy-700" />
              <div>
                <h2 className="font-black text-ink">Shared kitchen warning</h2>
                <p className="mt-2 text-sm leading-6 text-charcoal/68">
                  Food is prepared in a shared restaurant kitchen. Cross-contact is possible even when an allergen is not declared for a dish.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded border border-black/8 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-ink">
              <Info aria-hidden className="h-5 w-5 text-saffron-700" />
              How to read this matrix
            </h2>
            <div className="grid gap-2 text-sm text-charcoal/72 sm:grid-cols-2">
              {(Object.keys(ALLERGEN_STATUS_LABELS) as AllergenStatus[]).map((status) => (
                <div key={status} className="flex items-center gap-3">
                  <StatusBadge status={status} />
                  <span>{ALLERGEN_STATUS_LABELS[status]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded border border-black/8 bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-ink">
              <CheckCircle2 aria-hidden className="h-5 w-5 text-leaf" />
              Australian allergen names
            </h2>
            <p className="text-sm leading-6 text-charcoal/68">
              Australian guidance requires declared allergens to use clear required names. This page groups menu checks around wheat/gluten, milk, egg, peanut, sesame, soy, tree nuts, seafood allergens, lupin and sulphites.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a className="inline-flex items-center gap-1.5 text-sm font-black text-burgundy-700 hover:text-burgundy-900" href="https://www.foodstandards.gov.au/consumer/food-allergies/allergen-labelling" target="_blank" rel="noreferrer">
                FSANZ guidance <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
              </a>
              <a className="inline-flex items-center gap-1.5 text-sm font-black text-burgundy-700 hover:text-burgundy-900" href="https://www.foodauthority.nsw.gov.au/consumer/food-allergies-and-intolerances" target="_blank" rel="noreferrer">
                NSW Food Authority <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-8">
          {groupedRows.map(({ category, rows: categoryRows }) => (
            <section key={category.slug} aria-labelledby={`allergens-${category.slug}`}>
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-saffron-700">Category</p>
                  <h2 id={`allergens-${category.slug}`} className="mt-1 text-2xl font-black text-ink">
                    {category.name}
                  </h2>
                </div>
                <Link href="/contact" className="inline-flex items-center gap-2 rounded border border-burgundy-900/15 bg-white px-3 py-2 text-xs font-black text-burgundy-700 transition hover:border-burgundy-700">
                  <HelpCircle aria-hidden className="h-4 w-4" />
                  Ask about this category
                </Link>
              </div>

              <div className="overflow-x-auto rounded border border-black/8 bg-white shadow-sm">
                <table className="min-w-[1120px] w-full border-collapse text-left text-sm">
                  <thead className="bg-ink text-white">
                    <tr>
                      <th scope="col" className="sticky left-0 z-10 min-w-64 bg-ink px-4 py-3 text-xs font-black uppercase tracking-[0.14em]">
                        Dish
                      </th>
                      {ALLERGEN_COLUMNS.map((column) => (
                        <th key={column.key} scope="col" className="min-w-24 px-3 py-3 text-center text-[11px] font-black uppercase tracking-[0.12em]" title={column.requiredName}>
                          {column.label}
                        </th>
                      ))}
                      <th scope="col" className="min-w-72 px-4 py-3 text-xs font-black uppercase tracking-[0.14em]">
                        Kitchen note
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryRows.map((row) => (
                      <tr key={row.itemId} className="border-t border-black/8">
                        <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-4 font-black text-ink">
                          {row.itemName}
                        </th>
                        {ALLERGEN_COLUMNS.map((column) => (
                          <td key={column.key} className="px-3 py-3 text-center">
                            <StatusBadge status={row.allergens[column.key]} label={`${row.itemName}: ${column.label} ${ALLERGEN_STATUS_LABELS[row.allergens[column.key]]}`} />
                          </td>
                        ))}
                        <td className="px-4 py-4 text-sm leading-6 text-charcoal/66">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatusBadge({ status, label }: { status: AllergenStatus; label?: string }) {
  return (
    <span
      aria-label={label ?? ALLERGEN_STATUS_LABELS[status]}
      title={ALLERGEN_STATUS_LABELS[status]}
      className={cn("inline-grid h-7 min-w-7 place-items-center rounded border px-2 text-xs font-black", statusStyles[status])}
    >
      {statusSymbols[status]}
    </span>
  );
}
