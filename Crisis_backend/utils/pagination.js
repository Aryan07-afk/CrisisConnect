/**
 * Apply pagination to a Mongoose query.
 *
 * @param {import('mongoose').Query} query   – Mongoose query (before exec)
 * @param {object}                   params  – { page, limit } from req.query
 * @returns {Promise<{ docs: any[], pagination: object }>}
 */
const paginate = async (query, params = {}) => {
  const page  = Math.max(parseInt(params.page,  10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(params.limit, 10) || 20, 1), 100);
  const skip  = (page - 1) * limit;

  // Clone the query to count total documents matching the filter
  const countQuery = query.model.find(query.getFilter());
  const [docs, totalDocs] = await Promise.all([
    query.skip(skip).limit(limit),
    countQuery.countDocuments(),
  ]);

  const totalPages = Math.ceil(totalDocs / limit);

  return {
    docs,
    pagination: {
      page,
      limit,
      totalDocs,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

module.exports = paginate;
