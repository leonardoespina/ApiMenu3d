const { Op } = require("sequelize");

/**
 * Helper para búsquedas y paginación
 * @param {object} model - Modelo Sequelize (ej: Usuario, Plato)
 * @param {object} query - req.query con page, limit, search
 * @param {Array} searchFields - Campos donde buscar (ej: ['nombre', 'correo'])
 * @param {object} options - Opciones extra (order, where personalizado)
 */
const paginateAndSearch = async (
  model,
  query,
  searchFields = [],
  options = {}
) => {
  const { page = 1, limit = 10, search = "" } = query;

  const offset = (page - 1) * limit;

  let where = options.where || {};
  if (search && searchFields.length > 0) {
    where = {
      ...where,
      [Op.or]: searchFields.map((field) => ({
        [field]: { [Op.like]: `%${search}%` },
      })),
    };
  }

  const { rows, count } = await model.findAndCountAll({
    where,
    include: options.include || [], // ← AQUÍ está el cambio
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: options.order || [["createdAt", "DESC"]],
    attributes: options.attributes || { exclude: ["password"] },
  });

  return {
    total: count,
    currentPage: parseInt(page),
    totalPages: Math.ceil(count / limit),
    data: rows,
  };
};

module.exports = { paginateAndSearch };
