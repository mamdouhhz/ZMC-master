class APIFeatures {
  constructor(query, queryString) {
    (this.query = query), (this.queryString = queryString);
  }

  filter() {
    // 1A) Filter query object fields
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'fields', 'limit'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering add $ to operators
    let queryStr = JSON.stringify(queryObj);
    queryStr.replace(/\b(gt|gte|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort(field) {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query.sort(sortBy);
    } else {
      //   this.query.sort('-createdAt');
      this.query.sort(field);
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query.select(fields);
    } else {
      this.query.select('-__v');
    }
    return this;
  }

  async paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    // Count total documents
    const countQuery = await this.query.model.countDocuments(
      this.query.getQuery()
    );

    const totalCount = countQuery;

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Set pagination
    this.query = this.query.skip(skip).limit(limit);

    const results = await this.query;

    // Return paginated results along with metadata
    return {
      results,
      metadata: {
        totalResult: totalCount,
        totalPages,
      },
    };
  }

  search(field) {
    const queryField = this.queryString[field];
    if (queryField) {
      const searchString = queryField.split('+').join(' ');
      const searchRegExp = new RegExp(searchString, 'i');
      const searchQuery = { [field]: searchRegExp };
      this.query = this.query.find(searchQuery);
    }
    return this;
  }
}

module.exports = APIFeatures;
