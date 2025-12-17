export class BaseResponseDto<T> {
  data: T;
  message: string;
  statusCode: number;
  timestamp: string;

  constructor(data: T, message: string = 'Success', statusCode: number = 200) {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

export class PaginatedResponseDto<T> extends BaseResponseDto<T[]> {
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

  constructor(
    data: T[],
    totalItems: number,
    page: number,
    limit: number,
    message: string = 'Success',
    statusCode: number = 200,
  ) {
    super(data, message, statusCode);

    const totalPages = Math.ceil(totalItems / limit);

    this.meta = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}
