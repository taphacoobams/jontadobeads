// Source des données de la boutique : fichiers JSON de src/data, intégrés au build.
// « @data » pointe vers src/data (voir webpack.config.mjs) ; les tests le redirigent vers
// des données d'essai sans toucher aux vraies.
//
// Pour brancher plus tard une base de données ou un CMS, il suffit de remplacer cette fonction :
// le reste du site attend les mêmes clés et la même forme de données.
import products from '@data/products.json';
import categories from '@data/categories.json';
import collections from '@data/collections.json';
import settings from '@data/settings.json';
import content from '@data/content.json';
import photos from '@data/photos.json';
import blog from '@data/blog.json';

export function loadPublished() {
  return {
    products: products.products,
    categories: categories.categories,
    collections: collections.collections,
    settings,
    content,
    photos: photos.photos,
    blog: blog.posts,
  };
}
