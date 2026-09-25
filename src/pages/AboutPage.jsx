import About from '../components/About.jsx';
import Partners from '../components/Partners.jsx';

export default function AboutPage() {
    return (
        <div className="relative bg-white text-zinc-800 font-sans selection:bg-brand/30">
            <div className="h-16" />
            <About />
            <Partners />
        </div>
    );
}
