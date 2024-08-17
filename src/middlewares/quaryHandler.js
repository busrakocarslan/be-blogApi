"use strict";

module.exports = (req, res, next) => {
  /* FILTERING & SEARCHING & SORTING & PAGINATION */

  //? ### FILTERING ###

  // URL?filter[key1]=value1&filter[key2]=value2
  const filter = req.query?.filter || {};

  //* filter de direk eşleştirme yapar. filter zaten fielname olduğundan obj formatında geliyor.Bu sayede find in içine parametre olarak yazılabiliyor.

  //? ### SEARCHING ###

  // URL?search[key1]=value1&search[key2]=value2
  // https://www.mongodb.com/docs/manual/reference/operator/query/regex/
  const search = req.query?.search || {};
  for (let key in search) search[key] = { $regex: search[key], $options: "i" }; // case-sensitive olması diye(case-insensitive) options olarak i ekledim.

  //*filter değil search yapması için regex kullanıyoruz böylece tam eşitlik aramıyor içerisine bakıyır.

  //? ### SORTING ###

  // URL?sort[key1]=asc&sort[key2]=desc
  // asc: A-Z - desc: Z-A
  const sort = req.query?.sort || {};

  //? ### PAGINATION ###
  // mongoose da pagination yapısını kendimiz kuruyoruz.

  // URL?page=3&limit=10
  let limit = Number(req.query?.limit);

  //limit'in env dosyasında belirtilmesi gerekir.
  limit = limit > 0 ? limit : Number(process.env.PAGE_SIZE || 20);
  // giden gelen veri hep string olduğundan url e yazılan page ,n number olarak anlaşılabilmesi için aşağıda number kullandım.

  //URL yapısında page olmak zorunda.
  let page = Number(req.query?.page);
  page = page > 0 ? page - 1 : 0; // Backend'de sayfa sayısı her zaman (page - 1)'dir.
  // console.log(typeof page, page)

  let skip = Number(req.query?.skip);
  skip = skip > 0 ? skip : page * limit;

  //HEPSİNİ FUNC DA BİRARAYA GETİRME

  //? Run for output:
  res.getModelList = async (Model, customFilter = {}, populate = null) => {
    // spread ile obje içinde tüm filter search ve customfilter işlemlerini find içine alıyoruz. custom filter da olurda ben bu func i ilgili yerde filter etmek istersem dşye var.
    return await Model.find({ ...filter, ...search, ...customFilter })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate);
  };

  // Details:-datanon deteylarını görebilme,sadece sayısal değer döner
  res.getModelListDetails = async (Model, customFilter = {}) => {
    const data = await Model.find({ ...filter, ...search, ...customFilter });

    let details = {
      filter,
      search,
      sort,
      skip,
      limit,
      page,
      pages: {
        previous: page > 0 ? page : false,
        current: page + 1,
        next: page + 2,
        total: Math.ceil(data.length / limit),
      },
      totalRecords: data.length,
    };
    details.pages.next =
      details.pages.next > details.pages.total ? false : details.pages.next;
    if (details.totalRecords <= limit) details.pages = false;
    return details;
  };

  next();
};
