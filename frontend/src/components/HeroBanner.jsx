const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1920&h=850&fit=crop";

export default function HeroBanner({ badge, title, desc, image, contained = false, split = false }) {
  const imageUrl = image || DEFAULT_IMAGE;

  if (split) {
    return (
      <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24">
        <div className="relative grid grid-cols-1 sm:grid-cols-2 items-stretch overflow-hidden rounded-3xl shadow-[0_22px_60px_rgba(0,0,0,0.45)]">
          <div
            className="absolute inset-0 bg-cover bg-center animate-[heroZoom_12s_ease-in-out_forwards]"
            style={{ backgroundImage: `url('${imageUrl}')` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(20,4,5,0.95),rgba(20,4,5,0.6)_50%,transparent)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,#160506_0%,rgba(20,4,5,0.6)_40%,rgba(229,9,20,0.15)_100%)]" />
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[rgba(229,9,20,0.16)] blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[rgba(237,195,143,0.12)] blur-[90px] pointer-events-none" />
          <div className="relative flex items-center">
            <div className="px-6 md:px-10 py-8 md:py-10 text-left">
              <h1 className="text-2xl min-[400px]:text-3xl md:text-4xl lg:text-[44px] font-black text-white capitalize tracking-tight mb-3 [text-shadow:0_2px_14px_rgba(0,0,0,0.5)]">
                {title}
              </h1>
              {desc && (
                <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-[520px]">
                  {desc}
                </p>
              )}
            </div>
          </div>
          <div className="relative flex items-center justify-center p-5 md:p-8 min-h-[240px] md:min-h-[300px]">
            <img
              className="w-[170px] sm:w-[200px] lg:w-[230px] aspect-[2/3] object-cover rounded-2xl shadow-[0_22px_50px_rgba(0,0,0,0.55)]"
              src={imageUrl}
              alt={title}
            />
          </div>
        </div>
      </div>
    );
  }

  const background = (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center animate-[heroZoom_12s_ease-in-out_forwards]"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(20,4,5,0.95),rgba(20,4,5,0.6)_50%,transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,#160506_0%,rgba(20,4,5,0.6)_40%,rgba(229,9,20,0.15)_100%)]" />
      <div className="absolute top-1/4 left-[10%] sm:left-[15%] w-[160px] h-[160px] sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px] rounded-full bg-[rgba(229,9,20,0.15)] blur-[80px] sm:blur-[100px] md:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-[5%] sm:right-[10%] w-[140px] h-[140px] sm:w-[240px] sm:h-[240px] md:w-[300px] md:h-[300px] rounded-full bg-[rgba(237,195,143,0.12)] blur-[60px] sm:blur-[80px] md:blur-[100px] pointer-events-none" />
    </>
  );

  const content = (
    <div
      className={`relative z-10 w-full max-w-[1024px] mx-auto px-5 sm:px-6 lg:px-8 ${
        contained ? "py-14 md:py-20" : "pt-16 sm:pt-20 md:pt-28 pb-20 sm:pb-24 md:pb-24"
      }`}
    >
      <div className="max-w-[540px] text-left">
        {badge && (
          <span className="inline-flex items-center gap-2 bg-brand/90 text-white text-[11px] md:text-xs font-bold tracking-[2px] uppercase px-4 py-2 rounded-full mb-5 shadow-[0_4px_14px_rgba(229,9,20,0.4)]">
            {badge}
          </span>
        )}
        <h1 className="text-[26px] min-[400px]:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight text-balance mb-3 sm:mb-4 text-white capitalize [text-shadow:0_2px_14px_rgba(0,0,0,0.5)]">
          {title}
        </h1>
        {desc && (
          <p className="text-sm sm:text-base md:text-lg text-[var(--app-mute)] leading-relaxed mb-6">
            {desc}
          </p>
        )}
      </div>
    </div>
  );

  if (contained) {
    return (
      <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24">
        <div className="relative min-h-[30vh] sm:min-h-[34vh] md:min-h-[38vh] flex items-center overflow-hidden rounded-3xl shadow-[0_22px_60px_rgba(0,0,0,0.5)]">
          {background}
          {(title || desc || badge) && content}
        </div>
      </div>
    );
  }

  return (
    <section className="relative min-h-[85vh] sm:min-h-[88vh] md:min-h-[90vh] lg:min-h-screen flex items-center overflow-hidden bg-[var(--app-page)]">
      {background}
      {(title || desc || badge) && content}
    </section>
  );
}
