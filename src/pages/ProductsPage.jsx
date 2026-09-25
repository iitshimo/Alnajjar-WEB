import Products from '../components/Products.jsx';

export default function ProductsPage() {
    return (
        <div className="relative bg-zinc-50 min-h-screen text-zinc-800 font-sans selection:bg-brand/30">
            <div className="h-20 lg:h-24" />
            <Products />
        </div>
    );
}
