"use strict";

module.exports =  (req, res, next) => {
  //?filter[field]=value&search[field]=value&skip=10&limit=10&page=2&sort[field]=desc

  const filter = req.query?.filter || {};

  const search = req.query?.search || {};
  for (let key in search) search[key] = { $regex: search[key], $options: "i" };

  const sort = req.query?.sort || {};

  let limit = Number(req.query?.limit);
  limit = limit > 0 ? limit : Number(process.env.PAGE_SIZE || 10);

  let page = Number(req.query?.page);
  page = page > 0 ? page : 1;

  let skip = Number(req.query?.skip);
  skip = skip > 0 ? skip : (page - 1) * limit;

  res.getModelList = async (Model, customFilters = {}, populate = null) => {
    return await Model.find({ ...filter, ...search, ...customFilters })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate);
  };

  res.getModelListDetails = async (Model, customFilters = {}) => {
    const data = await Model.find({ ...filter, ...search, ...customFilters });

    const totalRecords =data.length
    const totalPages = Math.ceil(totalRecords / limit);


    let details = {
      filter,
      customFilters,
      search,
      skip,
      limit,
      page,
      pages:{
        provious: page > 1 ?  page - 1 : false,
        current : page,
        next : page < totalPages ? page +1 : false,
        totalPages,
      },
      totalRecords
    };

    // if(details?.page >= details?.pages?.totalPages) {details?.pages?.next = false;}
    // details.pages.next = details?.page >= details?.pages?.totalPages && false

    // if(details?.limit >= details?.totalRecords) {details?.pages = false;}
    details.pages =  details?.limit >= details?.totalRecords && false;

    return details;

  };

  next();
};
