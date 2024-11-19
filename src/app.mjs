import MongoConnection from "./mongo/MongoConnection.mjs";

const DB_NAME = "sample_mflix";
const COLLECTION_COMMENTS = "comments";
const COLLECTION_MOVIES = "movies";

const mongoConnection = new MongoConnection(process.env.MONGO_URI, DB_NAME);

const collectionComments = mongoConnection.getCollection(COLLECTION_COMMENTS);
const collectionMovies = mongoConnection.getCollection(COLLECTION_MOVIES);

collectionMovies
  .aggregate([
    {
      $bucketAuto: {
        groupBy: "$imdb.rating",
        buckets: 5,
      },
    },
  ])
  .toArray()
  .then((data) => console.log("first", data));

collectionMovies
  .find({})
  .limit(1)
  .project({ title: 1, _id: 0 })
  .toArray()
  .then((data) => console.log("second", data));

collectionComments
  .aggregate([
    { $limit: 5 },
    {
      $lookup: {
        from: "movies",
        localField: "movie_id",
        foreignField: "_id",
        as: "movieDetails",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            { $arrayElemAt: ["$movieDetails", 0] },
            "$$ROOT",
          ],
        },
      },
    },
    {
      $project: {
        title: 1,
        text: 1,
        _id: 0,
      },
    },
  ])
  .toArray()
  .then((data) => console.log("Query 1:", data));

  collectionMovies
  .aggregate([
    { $match: { year: 2010, genres: { $in: ["Comedy"] } } },
    { $addFields: { averageRating: 6.662839964300813 } },
    { $match: { "imdb.rating": { $gt: 6.662839964300813 } } },
    { $project: { title: 1, "imdb.rating": 1, _id: 0 } },
  ])
  .toArray()
  .then((data) => console.log("Query 2:", data))
  .catch((err) => console.error(err));







