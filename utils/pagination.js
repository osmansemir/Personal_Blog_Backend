/**
 * Parse and validate pagination parameters from request query
 * @param {Object} query - Request query object
 * @returns {Object} Validated pagination parameters
 */
export const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10)); // Max 100 items per page
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Create pagination response object
 * @param {Array} data - Array of documents
 * @param {number} total - Total count of documents
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Paginated response
 */
export const createPaginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    },
  };
};
