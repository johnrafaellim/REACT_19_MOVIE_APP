import { Client, TablesDB, Query, ID } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const tablesDB = new TablesDB(client);

export const updateSearchCount = async (searchTerm, movie) => {
  if (!searchTerm || !searchTerm.trim()) {
    console.error("Search term is required.");
    return;
  }
  console.log("searchTerm", searchTerm);

  // 1. Use Appwrite SDK to check if the search term exists in the database
  try {
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.equal("searchTerm", searchTerm.trim())],
    });

    console.log("result", result);

    // 2. If it does, update the count

    if (result.total > 0) {
      const existingRow = result.rows[0];

      await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: existingRow.$id, // Use the existing row's unique ID
        data: {
          count: existingRow.count + 1, // Increment the current count by 1
        },
      });
    } else {
      // 3. If it doesn't, create a new document with the search term and count as 1
      await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: ID.unique(), // Generates a unique ID for the new row
        data: {
          searchTerm,
          count: 1,
          poster_url: `http://image.tmdb.org/t/p/w500${movie.poster_path}`,
          movie_id: movie.id,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export const getTrendingMovies = async () => {
  try {
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.limit(5), Query.orderDesc("count")],
    });

    return result.rows;
  } catch (error) {
    console.error(error);
  }
};

export { client };
