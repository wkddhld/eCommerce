const express = require('express');
const router = express.Router();
const { Product, subCategory, Category } = require('../data');

// 모든 대분류와 소분류 카테고리 데이터 조회
router.get('/', async (req, res, next) => {
    try {
        // 대분류 카테고리 조회
        const categories = await Category.find().lean();

        // 각 대분류 카테고리에 해당하는 소분류 카테고리 조회 및 매핑
        const categoriesWithSubCategories = await Promise.all(
            categories.map(async (category) => {
                const subCategories = await subCategory.find({ mainCategoryNumber: category.number }).lean();
                return {
                    categoryNumber: category.number,
                    categoryName: category.name,
                    subCategories: subCategories.map((subCategory) => ({
                        subCategoryName: subCategory.name,
                        subCategoryNumber: subCategory.number,
                    })),
                };
            })
        );

        res.json({ err: null, data: categoriesWithSubCategories });
    } catch (e) {
        next(e);
    }
});

// 대분류 카테고리별 상품 조회
router.get('/:categoryNumber', async (req, res, next) => {
    try {
        const { categoryNumber } = req.params;

        // categoryNumber가 숫자인지 확인
        if (!Number.isInteger(Number(categoryNumber))) {
            const err = new Error('categoryNumber 필드는 number 타입이어야 합니다.');
            err.statusCode = 400;
            next(err);
            return;
        }

        // categoryNumber에 해당하는 상품 조회
        const categoryProducts = await Product.find({ categoryNumber: Number(categoryNumber) }).lean();

        // 해당 카테고리의 상품이 없는 경우
        if (!categoryProducts || categoryProducts.length === 0) {
            const err = new Error('해당 카테고리의 상품을 찾을 수 없습니다.');
            err.statusCode = 404;
            next(err);
            return;
        }

        // 상품 데이터 반환
        return res.json({
            err: null,
            data: categoryProducts.map(product => ({
                name: product.name,
                price: product.price,
                image: product.image,
            }))
        });
    } catch (e) {
        next(e);
    }
});



// 소분류 카테고리별 상품 조회
router.get('/:categoryNum/:subcategoryNum', async (req, res, next) => {
    const { categoryNum, subcategoryNum } = req.params;

    const categoryNumInt = Number(categoryNum);
    const subcategoryNumInt = Number(subcategoryNum);

    if (!Number.isInteger(Number(categoryNum)) || !Number.isInteger(Number(subcategoryNum))) {
        const err = new Error('categoryNumber field는 number type이어야 합니다.');
        err.statusCode = 400;
        next(err);
        return;
    }
    try {
        // categoryNum과 scategoryNum에 해당하는 소분류 카테고리 조회
        const subCate = await subCategory
            .findOne({
                mainCategoryNumber: categoryNumInt,
                number: subcategoryNumInt,
            })
            .lean();

        if (!subCate) {
            const err = new Error('해당 소분류 카테고리를 찾을 수 없습니다.');
            err.statusCode = 404;
            return next(err);
        }
        const products = await Product.find({
            categoryNumber: categoryNumInt,
            subCateogryNumber: subcategoryNumInt,
        }).lean();

        return res.json({
            err: null,
            data: {
                subcategory_name: subCate.name,
                products: products.map((prod) => ({
                    image: prod.image,
                    name: prod.name,
                    price: prod.price,
                })),
            },
        });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
