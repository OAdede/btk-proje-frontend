import React, { useState, useContext, useMemo, useEffect } from "react";
import { TableContext } from "../../context/TableContext";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext";
import "./StokUpdate.css";

const URUN_SAYFASI = 10;

function StokUpdate() {
    const {
        products,
        productsById, // şu an kullanılmıyor ama bırakıyorum
        ingredients,
        addProduct,
        deleteProduct,
        updateProduct,
        deleteProductIngredient,
        updateIngredientStock,
        addProductIngredient,
        addIngredient,
    } = useContext(TableContext);
    const { user } = useContext(AuthContext);
    const { colors } = useTheme();

    // CSS değişkenlerini dinamik olarak ayarla
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty("--card-background", colors.cardBackground);
        root.style.setProperty("--surface-background", colors.surfaceBackground);
        root.style.setProperty("--text", colors.text);
        root.style.setProperty("--text-secondary", colors.textSecondary);
        root.style.setProperty("--border", colors.border);
        root.style.setProperty("--shadow", colors.shadow);
        root.style.setProperty("--warning", colors.warning);
        root.style.setProperty("--warningHover", colors.warningHover);
        root.style.setProperty("--danger", colors.danger);
        root.style.setProperty("--dangerHover", colors.dangerHover);
        root.style.setProperty("--success", colors.success);
        root.style.setProperty("--primary", colors.primary);
    }, [colors]);

    const [aktifSekme, setAktifSekme] = useState("urunler");
    const [aktifKategori, setAktifKategori] = useState("Tümü");
    const [mevcutSayfa, setMevcutSayfa] = useState(1);
    const [pasifGizle, setPasifGizle] = useState(true);

    const [yeniUrun, setYeniUrun] = useState({
        name: "",
        price: "",
        description: "",
        category: "",
        recipe: [],
    });
    const [duzenleModal, setDuzenleModal] = useState({ acik: false, urun: null });
    const [icerikGuncelleModal, setIcerikGuncelleModal] = useState({
        acik: false,
        icerik: null,
        yeniMiktar: "",
        sebep: "PURCHASE",
        not: "",
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const [yeniModalIcerik, setYeniModalIcerik] = useState({
        ingredientId: "",
        quantity: "",
    });
    const [yeniUrunIcerik, setYeniUrunIcerik] = useState({
        ingredientId: "",
        quantity: "",
    });

    const [yeniIcerik, setYeniIcerik] = useState({
        name: "",
        unit: "",
        stockQuantity: "",
        minStock: "",
    });

    const isAdmin = user?.role === "admin";

    const kategoriler = useMemo(
        () => ["Tümü", ...Object.keys(products)],
        [products]
    );

    const gosterilecekUrunler = useMemo(() => {
        const allProducts = Object.values(products).flat();
        let list =
            aktifKategori === "Tümü" ? allProducts : products[aktifKategori] || [];
        if (pasifGizle) list = list.filter((p) => p.isActive !== false);
        return list;
    }, [products, aktifKategori, pasifGizle]);

    const sonUrunIndex = mevcutSayfa * URUN_SAYFASI;
    const ilkUrunIndex = sonUrunIndex - URUN_SAYFASI;
    const mevcutSayfaUrunleri = gosterilecekUrunler.slice(
        ilkUrunIndex,
        sonUrunIndex
    );
    const toplamSayfaSayisi = Math.ceil(
        gosterilecekUrunler.length / URUN_SAYFASI
    );

    const getProductStockStatus = (product) => {
        if (!product.recipe || product.recipe.length === 0) {
            return { durum: "Reçete Yok", renk: "var(--info)" };
        }

        let isCritical = false;
        for (const item of product.recipe) {
            const ingredient = ingredients[item.ingredientId];
            if (!ingredient) {
                return { durum: "Stok Bilgisi Yok", renk: "var(--info)" };
            }
            if (ingredient.stockQuantity < item.quantity) {
                return { durum: "Tükendi", renk: "var(--danger)" };
            }
            if (ingredient.stockQuantity <= ingredient.minStock) {
                isCritical = true;
            }
        }

        if (isCritical) return { durum: "Kritik", renk: "var(--warning)" };
        return { durum: "Yeterli", renk: "var(--success)" };
    };

    const urunEkle = async () => {
        if (
            !yeniUrun.name ||
            !yeniUrun.price ||
            !aktifKategori ||
            aktifKategori === "Tümü" ||
            !yeniUrun.description
        ) {
            alert("Lütfen tüm zorunlu alanları doldurun.");
            return;
        }
        const productData = {
            name: yeniUrun.name,
            price: Number(yeniUrun.price),
            description: yeniUrun.description,
            recipe: yeniUrun.recipe,
        };
        try {
            await addProduct(aktifKategori, productData);
            setYeniUrun({ name: "", price: "", description: "", recipe: [] });
            setYeniUrunIcerik({ ingredientId: "", quantity: "" });
        } catch (error) {
            alert(`Ürün eklenirken hata: ${error.message}`);
        }
    };

    const urunSil = async (urun) => {
        if (window.confirm(`${urun.name} ürününü silmek istiyor musunuz?`)) {
            setIsDeleting(true);
            try {
                await deleteProduct(urun.id);
            } catch (error) {
                console.error("Ürün silinirken hata:", error);
                alert(`Ürün silinirken hata: ${error.message}`);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const urunDuzenle = (urun) => {
        setDuzenleModal({
            acik: true,
            urun: { ...urun, recipe: urun.recipe || [] },
        });
    };

    const miktarKaydet = async () => {
        if (!duzenleModal.urun) return;
        try {
            await updateProduct(duzenleModal.urun.category, duzenleModal.urun);
            setDuzenleModal({ acik: false, urun: null });
        } catch (error) {
            alert(`Ürün güncellenirken hata: ${error.message}`);
        }
    };

    const handleModalChange = (field, value) => {
        setDuzenleModal((prev) => ({
            ...prev,
            urun: { ...prev.urun, [field]: value },
        }));
    };

    const handleAddRecipeItem = () => {
        if (yeniUrunIcerik.ingredientId && yeniUrunIcerik.quantity) {
            setYeniUrun((prev) => ({
                ...prev,
                recipe: [
                    ...prev.recipe,
                    {
                        ingredientId: parseInt(yeniUrunIcerik.ingredientId, 10),
                        quantity: Number(yeniUrunIcerik.quantity),
                    },
                ],
            }));
            setYeniUrunIcerik({ ingredientId: "", quantity: "" });
        } else {
            alert("Lütfen içerik ve miktar giriniz.");
        }
    };

    const handleRemoveNewRecipeItem = (index) => {
        setYeniUrun((prev) => ({
            ...prev,
            recipe: prev.recipe.filter((_, i) => i !== index),
        }));
    };

    const handleIngredientQuantityChange = (ingredientId, event) => {
        const newQuantity = parseFloat(event.target.value);
        setDuzenleModal((prev) => {
            const updatedRecipe = prev.urun.recipe.map((item) =>
                item.ingredientId === Number(ingredientId)
                    ? { ...item, quantity: isNaN(newQuantity) ? 0 : newQuantity }
                    : item
            );
            return { ...prev, urun: { ...prev.urun, recipe: updatedRecipe } };
        });
    };

    const handleDeleteModalIngredient = async (ingredientId) => {
        if (!duzenleModal.urun) return;
        try {
            await deleteProductIngredient(duzenleModal.urun.id, ingredientId);
            setDuzenleModal((prev) => {
                const updatedRecipe = prev.urun.recipe.filter(
                    (item) => item.ingredientId !== ingredientId
                );
                return { ...prev, urun: { ...prev.urun, recipe: updatedRecipe } };
            });
        } catch (error) {
            alert("Malzeme silinirken bir hata oluştu.");
        }
    };

    const handleAddModalIngredient = async () => {
        if (!yeniModalIcerik.ingredientId || !yeniModalIcerik.quantity) {
            alert("Lütfen içerik ve miktar giriniz.");
            return;
        }
        const newIngredientData = {
            productId: duzenleModal.urun.id,
            ingredientId: parseInt(yeniModalIcerik.ingredientId, 10),
            quantity: parseFloat(yeniModalIcerik.quantity),
        };

        try {
            await addProductIngredient(duzenleModal.urun.id, newIngredientData);
            setDuzenleModal((prev) => {
                const updatedRecipe = [
                    ...(prev.urun.recipe || []),
                    {
                        ingredientId: newIngredientData.ingredientId,
                        quantity: newIngredientData.quantity,
                    },
                ];
                return { ...prev, urun: { ...prev.urun, recipe: updatedRecipe } };
            });
            setYeniModalIcerik({ ingredientId: "", quantity: "" });
        } catch (error) {
            alert("Reçeteye içerik eklenirken bir hata oluştu.");
        }
    };

    const sonrakiSayfa = () =>
        setMevcutSayfa((prev) => Math.min(prev + 1, toplamSayfaSayisi));
    const oncekiSayfa = () =>
        setMevcutSayfa((prev) => Math.max(prev - 1, 1));
    const sayfaDegistir = (sayfa) => setMevcutSayfa(sayfa);

    const getIngredientStatus = (ingredient) => {
        if (ingredient.stockQuantity === 0) {
            return { durum: "Tükendi", renk: "var(--danger)" };
        }
        if (ingredient.stockQuantity <= ingredient.minStock) {
            return { durum: "Kritik", renk: "var(--warning)" };
        }
        return { durum: "Yeterli", renk: "var(--success)" };
    };

    const handleOpenIngredientModal = (ingredient) => {
        setIcerikGuncelleModal({
            acik: true,
            icerik: ingredient,
            yeniMiktar: ingredient.stockQuantity,
            sebep: "PURCHASE",
            not: "",
        });
    };

    const handleIngredientStockUpdate = async () => {
        if (!icerikGuncelleModal.icerik) return;

        const { icerik, yeniMiktar, sebep, not } = icerikGuncelleModal;
        const change = Number(yeniMiktar) - icerik.stockQuantity;

        try {
            await updateIngredientStock(icerik.id, change, sebep, not);
            setIcerikGuncelleModal({
                acik: false,
                icerik: null,
                yeniMiktar: "",
                sebep: "PURCHASE",
                not: "",
            });
        } catch (error) {
            alert("Stok güncellenirken bir hata oluştu.");
        }
    };

    const handleCloseEditModal = () => {
        setDuzenleModal({ acik: false, urun: null });
    };

    const handleAddIngredient = async () => {
        if (
            !yeniIcerik.name ||
            !yeniIcerik.unit ||
            yeniIcerik.stockQuantity === "" ||
            yeniIcerik.minStock === ""
        ) {
            alert("Lütfen tüm içerik bilgilerini doldurun.");
            return;
        }
        try {
            await addIngredient({
                name: yeniIcerik.name,
                unit: yeniIcerik.unit,
                stockQuantity: Number(yeniIcerik.stockQuantity),
                minStock: Number(yeniIcerik.minStock),
            });
            setYeniIcerik({ name: "", unit: "", stockQuantity: "", minStock: "" });
        } catch (error) {
            alert(`İçerik eklenirken hata: ${error.message}`);
        }
    };

    return (
        <div className="stok-update-container">
            <h2 className="stok-update-title">Ürün & Stok Yönetimi</h2>

            <div className="tab-buttons">
                <button
                    onClick={() => setAktifSekme("urunler")}
                    className={`tab-button ${aktifSekme === "urunler" ? "active" : ""}`}
                >
                    Ürünler
                </button>
                <button
                    onClick={() => setAktifSekme("icerikler")}
                    className={`tab-button ${aktifSekme === "icerikler" ? "active" : ""}`}
                >
                    İçerikler
                </button>
            </div>

            {aktifSekme === "urunler" ? (
                <>
                    <div className="category-filter-buttons">
                        {kategoriler.map((kategori) => (
                            <button
                                key={kategori}
                                onClick={() => {
                                    setAktifKategori(kategori);
                                    setMevcutSayfa(1);
                                }}
                                className={`category-filter-button ${aktifKategori === kategori ? "active" : ""
                                    }`}
                            >
                                {kategori}
                            </button>
                        ))}

                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginLeft: "8px",
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={pasifGizle}
                                onChange={(e) => setPasifGizle(e.target.checked)}
                            />
                            Pasif ürünleri gizle
                        </label>
                    </div>

                    {isAdmin && aktifKategori !== "Tümü" && (
                        <div className="add-product-form">
                            <div className="add-product-form-content">
                                <div className="form-inputs">
                                    <input
                                        type="text"
                                        placeholder="Ürün Adı"
                                        value={yeniUrun.name}
                                        onChange={(e) =>
                                            setYeniUrun({ ...yeniUrun, name: e.target.value })
                                        }
                                        className="product-name-input"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Fiyat (₺)"
                                        value={yeniUrun.price}
                                        onChange={(e) =>
                                            setYeniUrun({ ...yeniUrun, price: e.target.value })
                                        }
                                        className="product-price-input"
                                    />
                                    <textarea
                                        placeholder="Açıklama"
                                        value={yeniUrun.description}
                                        onChange={(e) =>
                                            setYeniUrun({ ...yeniUrun, description: e.target.value })
                                        }
                                        rows="3"
                                        className="product-description-input"
                                    />
                                </div>

                                <div className="form-recipe">
                                    <div className="modal-recipe-section">
                                        <strong>Reçete:</strong>
                                        {yeniUrun.recipe.length > 0 && (
                                            <ul className="recipe-list">
                                                {yeniUrun.recipe.map((item, index) => (
                                                    <li key={index} className="modal-recipe-item">
                                                        <span>
                                                            {ingredients[item.ingredientId]?.name}:{" "}
                                                            {item.quantity}{" "}
                                                            {ingredients[item.ingredientId]?.unit}
                                                        </span>
                                                        <button
                                                            onClick={() => handleRemoveNewRecipeItem(index)}
                                                            className="delete-button"
                                                        >
                                                            Sil
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        <div className="recipe-add-form">
                                            <strong>Reçeteye Malzeme Ekle:</strong>
                                            <div className="recipe-form-inputs">
                                                <select
                                                    value={yeniUrunIcerik.ingredientId}
                                                    onChange={(e) =>
                                                        setYeniUrunIcerik({
                                                            ...yeniUrunIcerik,
                                                            ingredientId: e.target.value,
                                                        })
                                                    }
                                                >
                                                    <option value="">Malzeme Seçin</option>
                                                    {Object.values(ingredients).map((ing) => (
                                                        <option key={ing.id} value={ing.id}>
                                                            {ing.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    placeholder="Miktar"
                                                    value={yeniUrunIcerik.quantity}
                                                    onChange={(e) =>
                                                        setYeniUrunIcerik({
                                                            ...yeniUrunIcerik,
                                                            quantity: e.target.value,
                                                        })
                                                    }
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddRecipeItem}
                                                    className="modal-add-ingredient-button"
                                                >
                                                    Ekle
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button onClick={urunEkle} className="add-product-button">
                                Ekle
                            </button>
                        </div>
                    )}

                    <div className="product-list">
                        {mevcutSayfaUrunleri.length > 0 ? (
                            mevcutSayfaUrunleri.map((urun) => {
                                const durum = getProductStockStatus(urun);
                                return (
                                    <div key={urun.id} className="product-list-item">
                                        <div className="item-details">
                                            <div className="item-name">{urun.name}</div>
                                            <div className="item-price">{urun.price} ₺</div>
                                            <div className="item-description">
                                                {urun.description}
                                            </div>
                                            <div className="item-recipe">
                                                <strong>Reçete:</strong>
                                                {urun.recipe && urun.recipe.length > 0 ? (
                                                    <ul>
                                                        {urun.recipe.map((item, index) => (
                                                            <li key={index}>
                                                                {ingredients[item.ingredientId]?.name}:{" "}
                                                                {item.quantity}{" "}
                                                                {ingredients[item.ingredientId]?.unit}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span>Reçete bulunamadı.</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="item-status-and-actions">
                                            <div
                                                className="item-status"
                                                style={{ backgroundColor: durum.renk }}
                                            >
                                                {durum.durum}
                                            </div>
                                            {isAdmin && (
                                                <div className="item-actions">
                                                    <button
                                                        onClick={() => urunDuzenle(urun)}
                                                        className="edit-button"
                                                    >
                                                        Düzenle
                                                    </button>
                                                    <button
                                                        onClick={() => urunSil(urun)}
                                                        className="delete-button"
                                                        disabled={isDeleting}
                                                    >
                                                        {isDeleting ? "Siliniyor..." : "Sil"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="no-products-message">
                                Bu kategoride ürün bulunamadı.
                            </p>
                        )}
                    </div>

                    {toplamSayfaSayisi > 1 && (
                        <div className="pagination-buttons">
                            <button onClick={oncekiSayfa} disabled={mevcutSayfa === 1}>
                                &laquo;
                            </button>
                            {Array.from({ length: toplamSayfaSayisi }, (_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => sayfaDegistir(index + 1)}
                                    className={mevcutSayfa === index + 1 ? "active" : ""}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                onClick={sonrakiSayfa}
                                disabled={mevcutSayfa === toplamSayfaSayisi}
                            >
                                &raquo;
                            </button>
                        </div>
                    )}

                    {isAdmin && duzenleModal.acik && (
                        <div className="edit-modal-overlay">
                            <div className="edit-modal-content">
                                <h3>Ürün Bilgilerini Düzenle</h3>
                                <div className="edit-modal-form">
                                    <div className="modal-item-name">
                                        {duzenleModal.urun?.name}
                                    </div>
                                    <label>Fiyat:</label>
                                    <input
                                        type="number"
                                        value={duzenleModal.urun.price}
                                        onChange={(e) => handleModalChange("price", e.target.value)}
                                    />
                                </div>

                                <div className="modal-recipe-section">
                                    <div className="item-recipe">
                                        <strong>Reçete:</strong>
                                        {duzenleModal.urun.recipe &&
                                            duzenleModal.urun.recipe.length > 0 ? (
                                            <ul>
                                                {duzenleModal.urun.recipe.map((item, index) => (
                                                    <li key={index} className="modal-recipe-item">
                                                        <span>{ingredients[item.ingredientId]?.name}</span>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) =>
                                                                handleIngredientQuantityChange(
                                                                    item.ingredientId,
                                                                    e
                                                                )
                                                            }
                                                            className="recipe-quantity-input"
                                                        />
                                                        <span>{ingredients[item.ingredientId]?.unit}</span>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteModalIngredient(item.ingredientId)
                                                            }
                                                            className="delete-button"
                                                        >
                                                            Sil
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span>Reçete bulunamadı.</span>
                                        )}
                                    </div>

                                    <div className="recipe-add-form">
                                        <strong>Reçeteye Malzeme Ekle:</strong>
                                        <div className="recipe-form-inputs">
                                            <select
                                                value={yeniModalIcerik.ingredientId}
                                                onChange={(e) =>
                                                    setYeniModalIcerik({
                                                        ...yeniModalIcerik,
                                                        ingredientId: e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="">Malzeme Seçin</option>
                                                {Object.values(ingredients).map((ing) => (
                                                    <option key={ing.id} value={ing.id}>
                                                        {ing.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                placeholder="Miktar"
                                                value={yeniModalIcerik.quantity}
                                                onChange={(e) =>
                                                    setYeniModalIcerik({
                                                        ...yeniModalIcerik,
                                                        quantity: e.target.value,
                                                    })
                                                }
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddModalIngredient}
                                                className="modal-add-ingredient-button"
                                            >
                                                Ekle
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="edit-modal-actions">
                                    <button
                                        onClick={handleCloseEditModal}
                                        className="cancel-button"
                                    >
                                        İptal
                                    </button>
                                    <button onClick={miktarKaydet} className="save-button">
                                        Kaydet
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="ingredient-section-container">
                    {isAdmin && (
                        <div className="add-ingredient-form">
                            <h3>Yeni İçerik Ekle</h3>
                            <div className="add-ingredient-inputs">
                                <input
                                    type="text"
                                    placeholder="İçerik Adı"
                                    value={yeniIcerik.name}
                                    onChange={(e) =>
                                        setYeniIcerik({ ...yeniIcerik, name: e.target.value })
                                    }
                                />
                                <input
                                    type="text"
                                    placeholder="Birim (kg, adet, ml)"
                                    value={yeniIcerik.unit}
                                    onChange={(e) =>
                                        setYeniIcerik({ ...yeniIcerik, unit: e.target.value })
                                    }
                                />
                                <input
                                    type="number"
                                    placeholder="Başlangıç Stoğu"
                                    value={yeniIcerik.stockQuantity}
                                    onChange={(e) =>
                                        setYeniIcerik({
                                            ...yeniIcerik,
                                            stockQuantity: e.target.value,
                                        })
                                    }
                                />
                                <input
                                    type="number"
                                    placeholder="Minimum Stok"
                                    value={yeniIcerik.minStock}
                                    onChange={(e) =>
                                        setYeniIcerik({ ...yeniIcerik, minStock: e.target.value })
                                    }
                                />
                                <button onClick={handleAddIngredient} className="add-button">
                                    Ekle
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="ingredient-list">
                        {Object.values(ingredients).length > 0 ? (
                            Object.values(ingredients).map((ingredient) => {
                                const durum = getIngredientStatus(ingredient);
                                return (
                                    <div key={ingredient.id} className="ingredient-list-item">
                                        <div className="item-name">{ingredient.name}</div>
                                        <div className="item-stock">
                                            {ingredient.stockQuantity} {ingredient.unit}
                                        </div>
                                        <div className="item-min-stock">
                                            Min: {ingredient.minStock} {ingredient.unit}
                                        </div>
                                        <div
                                            className="item-status"
                                            style={{ backgroundColor: durum.renk }}
                                        >
                                            {durum.durum}
                                        </div>
                                        {isAdmin && (
                                            <div className="item-actions">
                                                <button
                                                    onClick={() => handleOpenIngredientModal(ingredient)}
                                                    className="edit-button"
                                                >
                                                    Stok Güncelle
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p className="no-products-message">Hiç içerik bulunamadı.</p>
                        )}
                    </div>
                </div>
            )}

            {isAdmin && icerikGuncelleModal.acik && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal-content">
                        <h3>İçerik Stoğunu Güncelle</h3>
                        <div className="edit-modal-form">
                            <div className="modal-item-name">
                                {icerikGuncelleModal.icerik?.name}
                            </div>
                            <label>
                                Yeni Stok Miktarı ({icerikGuncelleModal.icerik?.unit}):
                            </label>
                            <input
                                type="number"
                                value={icerikGuncelleModal.yeniMiktar}
                                onChange={(e) =>
                                    setIcerikGuncelleModal((prev) => ({
                                        ...prev,
                                        yeniMiktar: e.target.value,
                                    }))
                                }
                            />
                            <label>Değişim Sebebi:</label>
                            <select
                                value={icerikGuncelleModal.sebep}
                                onChange={(e) =>
                                    setIcerikGuncelleModal((prev) => ({
                                        ...prev,
                                        sebep: e.target.value,
                                    }))
                                }
                            >
                                <option value="PURCHASE">Satın Alma</option>
                                <option value="WASTAGE">Fire</option>
                                <option value="MANUAL_ADJUSTMENT">Manuel Ayar</option>
                            </select>
                            <label>Açıklama (İsteğe bağlı):</label>
                            <textarea
                                value={icerikGuncelleModal.not}
                                onChange={(e) =>
                                    setIcerikGuncelleModal((prev) => ({
                                        ...prev,
                                        not: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="edit-modal-actions">
                            <button
                                onClick={() =>
                                    setIcerikGuncelleModal({
                                        acik: false,
                                        icerik: null,
                                        yeniMiktar: "",
                                        sebep: "PURCHASE",
                                        not: "",
                                    })
                                }
                                className="cancel-button"
                            >
                                İptal
                            </button>
                            <button onClick={handleIngredientStockUpdate} className="save-button">
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StokUpdate;
