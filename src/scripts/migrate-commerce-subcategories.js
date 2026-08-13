require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Professional = require('../models/Professional');
const logger = require('../utils/logger');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/miprofesional';

// Map legacy commerce slugs to new subCategories
const LEGACY_TO_NEW = {
  'com-farmacia': 'farmacias',
  'com-optica': 'opticas',
  'com-kiosco': 'kioscos',
  'com-rotiseria': 'rotiserias',
  'com-tienda': 'tiendas-de-ropa',
  'com-perfumeria': 'perfumerias',
  'com-almacen': 'bazar',
  'com-panaderia': 'panaderias',
  'com-carniceria': 'parrillas',
  'com-verduleria': 'bazar',
  'com-heladeria': 'heladerias',
  'com-libreria': 'librerias',
  'com-jugueteria': 'regalerias',
  'com-ferreteria': 'ferreterias',
  'com-bazar': 'bazar',
  'com-muebleria': 'mueblerias',
  'com-electro': 'electrodomesticos',
  'com-alimentos-mayorista': 'mayoristas',
  'com-bebidas-mayorista': 'mayoristas',
  'com-distribuidora': 'mayoristas',
  'com-limpieza-industrial': 'mayoristas',
  'com-mixto-almacen': 'bazar',
  'com-mixto-tienda': 'tiendas-de-ropa',
  'com-mixto-dual': 'bazar',
  'almacen': 'bazar',
  'supermercado': 'bazar',
  'dietetica': 'panaderias',
  'carniceria': 'parrillas',
  'panaderia': 'panaderias',
  'verduleria': 'bazar',
  'vineria': 'restaurantes',
  'heladeria': 'heladerias',
  'libreria': 'librerias',
  'indumentaria': 'tiendas-de-ropa',
  'regalos': 'regalerias',
  'ferreteria': 'ferreterias',
  'electrodomesticos': 'electrodomesticos',
  'farmacia': 'farmacias',
  'perfumeria': 'perfumerias',
  'jugueteria': 'regalerias',
  'tienda-mascotas': 'pet-shop',
  'casa-repuestos': 'repuestos-del-automotor',
  'muebleria': 'mueblerias',
  'bazar': 'bazar',
  'productos-regionales': 'bazar',
  'cerrajeria-comercial': 'ferreterias',
  'vigilancia-privada': 'ferreterias',
  'alarmas-monitoreo': 'ferreterias',
  'seguridad-electronica': 'casas-de-electricidad',
  'seguridad-personal': 'ferreterias',
  'proteccion-incendios': 'ferreterias',
};

async function migrate() {
  try {
    console.log('Migrando subcategorias de comercios...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB');

    const commercePros = await Professional.find({ primaryCategory: 'comercio' });
    let updated = 0;
    let alreadyMigrated = 0;

    for (const pro of commercePros) {
      if (pro.subCategories && pro.subCategories.length > 0) {
        alreadyMigrated++;
        continue;
      }

      const newSubCats = [];

      // Migrate from subCategory field
      if (pro.subCategory) {
        const legacySlug = pro.subCategory;
        const mapped = LEGACY_TO_NEW[legacySlug];
        if (mapped) {
          newSubCats.push(mapped);
        } else {
          // Try direct mapping: lowercase + replace spaces with hyphens
          const directSlug = legacySlug.toLowerCase().replace(/\s+/g, '-');
          newSubCats.push(directSlug);
        }
      }

      // Also check categories array for commerce subcategories
      if (pro.categories && pro.categories.length) {
        const catIds = pro.categories.map(c => c.categoryId?.toString()).filter(Boolean);
        if (catIds.length) {
          const Category = mongoose.model('Category');
          const cats = await Category.find({ _id: { $in: catIds } }).lean();
          for (const cat of cats) {
            const mapped = LEGACY_TO_NEW[cat.slug];
            if (mapped && !newSubCats.includes(mapped)) {
              newSubCats.push(mapped);
            }
          }
        }
      }

      if (newSubCats.length > 0) {
        pro.subCategories = newSubCats;
        if (!pro.primaryCategory) pro.primaryCategory = 'comercio';
        await pro.save();
        updated++;
      } else {
        // Fallback: assign a default subCategory
        pro.subCategories = ['bazar'];
        if (!pro.primaryCategory) pro.primaryCategory = 'comercio';
        await pro.save();
        updated++;
      }
    }

    const totalCommerce = commercePros.length;
    console.log(`\nMigracion completada:`);
    console.log(`  - Total comercios: ${totalCommerce}`);
    console.log(`  - Ya migrados: ${alreadyMigrated}`);
    console.log(`  - Migrados a subCategories[]: ${updated}`);
    console.log(`\nLa migracion ha finalizado exitosamente.`);
    process.exit(0);
  } catch (error) {
    console.error('Error en migracion:', error.message);
    logger.error('Migration commerce subcategories error:', error);
    process.exit(1);
  }
}

migrate();
