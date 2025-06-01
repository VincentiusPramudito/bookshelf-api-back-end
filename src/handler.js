const { nanoid } = require('nanoid');
const books = require('./books');

const getAllBooksHandler = (request, h) => {
  let booksData = [...books].map((book) => {
    return {
      id: book.id,
      name: book.name,
      reading: book.reading,
      finished: book.finished,
      publisher: book.publisher,
    };
  });

  if (request.query.name) {
    const name = request.query.name.toLowerCase();
    booksData = [...booksData].filter((book) => {
      return book.name.toLowerCase().includes(name);
    });
  }

  if (request.query.reading) {
    const statusReading = request.query.reading === '1' ? true : false;
    booksData = [...booksData].filter((book) => {
      return book.reading == statusReading;
    });
  }

  if (request.query.finished) {
    const statusFinished = request.query.finished === '1' ? true : false;
    booksData = [...booksData].filter((book) => {
      return book.finished == statusFinished;
    });
  }

  const response = h.response({
    status: 'success',
    data: {
      books: [...booksData].map((book) => {
        return { id: book.id, name: book.name, publisher: book.publisher };
      }),
    },
  });
  response.code(200);
  return response;
};

const addBookHandler = (request, h) => {
  const id = nanoid(16);
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  if (!name || pageCount < readPage) {
    let errorMessage = 'Gagal menambahkan buku.';
    if (!name) errorMessage = 'Gagal menambahkan buku. Mohon isi nama buku';
    if (pageCount < readPage) errorMessage = 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount';

    const response = h.response({
      status: 'fail',
      message: errorMessage,
    });
    response.code(400);
    return response;
  }

  const newBook = { id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt };
  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;
  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const book = [...books].filter((book) => book.id === bookId);

  if (book.length) {
    return {
      status: 'success',
      data: {
        book: book[0],
      },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
    code: 404,
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
  const finished = pageCount === readPage;
  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.id === bookId);

  if (index === -1) {
    const errorMessage = 'Gagal memperbarui buku. Id tidak ditemukan';
    const response = h.response({
      status: 'fail',
      message: errorMessage,
    });
    response.code(404);
    return response;
  } else {
    if (!name || pageCount < readPage) {
      let errorMessage = 'Gagal memperbarui buku. Id tidak ditemukan';
      if (!name) errorMessage = 'Gagal memperbarui buku. Mohon isi nama buku';
      if (pageCount < readPage)
        errorMessage =
          'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount';
      const response = h.response({
        status: 'fail',
        message: errorMessage,
      });
      response.code(400);
      return response;
    }

    books[index] = { ...books[index], bookId, name, year, author, summary, publisher, pageCount, readPage, finished, reading, updatedAt };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  getAllBooksHandler,
  addBookHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
