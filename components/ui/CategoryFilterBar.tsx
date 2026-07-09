const selectClassName =
  "shrink-0 rounded-lg border border-brand-blushDark bg-brand-white px-3 py-2 text-sm text-brand-plum";

export default function CategoryFilterBar() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 lg:overflow-visible lg:pb-0">
      <label className="sr-only" htmlFor="fabric-filter">
        Fabric
      </label>
      <select id="fabric-filter" name="fabric" className={selectClassName}>
        <option value="">All fabrics</option>
        <option value="silk">Silk</option>
        <option value="cotton">Cotton</option>
        <option value="linen">Linen</option>
        <option value="organza">Organza</option>
      </select>

      <label className="sr-only" htmlFor="price-filter">
        Price range
      </label>
      <select id="price-filter" name="price" className={selectClassName}>
        <option value="">All prices</option>
        <option value="0-5000">Under ₹5,000</option>
        <option value="5000-10000">₹5,000 – ₹10,000</option>
        <option value="10000-20000">₹10,000 – ₹20,000</option>
        <option value="20000+">Above ₹20,000</option>
      </select>

      <label className="sr-only" htmlFor="sort">
        Sort by
      </label>
      <select id="sort" name="sort" className={selectClassName}>
        <option value="newest">Newest</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
    </div>
  );
}
