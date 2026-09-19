import { useEffect, useState } from "react";
import api from "../api/client";

export default function useHeroImage(page, fallback) {
  const [image, setImage] = useState(fallback);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/heroes")
      .then(({ data }) => {
        if (cancelled) return;
        const hero = (Array.isArray(data) ? data : []).find((h) => h.page === page);
        if (hero?.image) setImage(hero.image);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [page]);

  return image;
}