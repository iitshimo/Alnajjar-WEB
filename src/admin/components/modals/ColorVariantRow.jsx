import { useRef, useCallback } from 'react';

const compressImage = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;
            if (width > height) {
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            } else {
                if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

const filesToBase64 = (files) => Promise.all(Array.from(files).map(compressImage));
export default function ColorVariantRow({ index, cv, onColorChange, onLabelChange, onImagesChange, onRemove }) {
    const colorImgInputRef = useRef(null);
    const images = cv.images || (cv.image ? [cv.image] : []);

    const handleAddImages = useCallback(async (files) => {
        const b = await filesToBase64(files);
        onImagesChange([...images, ...b]);
    }, [images, onImagesChange]);

    const removeImg = (idx) => onImagesChange(images.filter((_, i) => i !== idx));
    const makeMain = (idx) => {
        const imgs = [...images];
        const [item] = imgs.splice(idx, 1);
        imgs.unshift(item);
        onImagesChange(imgs);
    };

    return (
        <div className="bg-[#0f0f12] border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-3">
            {/* Top row: color circle + name + remove */}
            <div className="flex items-center gap-3">
                {/* Circular color picker */}
                <div className="relative shrink-0">
                    <label
                        className="w-11 h-11 rounded-full border-2 border-white/20 cursor-pointer overflow-hidden flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: cv.color }}
                        title="Click to change color"
                    >
                        <input
                            type="color"
                            value={cv.color}
                            onChange={e => onColorChange(e.target.value)}
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                        <span className="material-icons text-white/60 text-[13px] drop-shadow">colorize</span>
                    </label>
                </div>

                {/* Color name */}
                <input
                    type="text"
                    value={cv.label || ''}
                    onChange={e => onLabelChange(e.target.value)}
                    placeholder="Color name (e.g. Pearl White)…"
                    className="flex-1 bg-[#1a1a1e] border border-white/8 rounded-xl px-3 py-2 text-[12px] text-white focus:outline-none focus:border-brand/50 transition-colors min-w-0"
                />

                {/* Remove color */}
                <button
                    onClick={onRemove}
                    className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors shrink-0"
                >
                    <span className="material-icons text-[15px]">close</span>
                </button>
            </div>

            {/* Image gallery for this color */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.15em]">
                        Images for this color
                    </span>
                    <button
                        type="button"
                        onClick={() => colorImgInputRef.current?.click()}
                        className="flex items-center gap-1 text-[10px] font-bold text-brand hover:text-brand/80 transition-colors"
                    >
                        <span className="material-icons text-[13px]">add_photo_alternate</span> Add
                    </button>
                    <input
                        ref={colorImgInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={e => { if (e.target.files?.length) handleAddImages(e.target.files); e.target.value = ''; }}
                    />
                </div>

                <div
                    className="min-h-14 border border-dashed border-white/8 rounded-xl p-2 flex flex-wrap gap-2 items-start hover:border-brand/20 transition-colors"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleAddImages(e.dataTransfer.files); }}
                >
                    {images.length === 0 && (
                        <div
                            className="w-full flex items-center justify-center gap-2 py-2 text-zinc-700 cursor-pointer text-[11px]"
                            onClick={() => colorImgInputRef.current?.click()}
                        >
                            <span className="material-icons text-[18px]">image</span>
                            Drag & drop or tap to add images for this color
                        </div>
                    )}
                    {images.map((src, idx) => (
                        <div key={idx} className="relative group/cimg w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/6">
                            <img src={src} alt="" className="w-full h-full object-cover" />
                            {idx === 0 && (
                                <div className="absolute top-0.5 left-0.5 bg-brand text-black text-[6px] font-black px-1 rounded leading-4">MAIN</div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/cimg:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                {idx !== 0 && (
                                    <button type="button" onClick={() => makeMain(idx)} className="w-5 h-5 rounded-full bg-brand flex items-center justify-center text-black">
                                        <span className="material-icons text-[10px] text-black">star</span>
                                    </button>
                                )}
                                <button type="button" onClick={() => removeImg(idx)} className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                    <span className="material-icons text-[10px] text-white">close</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
