// The race reactor never opens files or reads a clock. Report unsupported calls explicitly.
export const clock_time_get = () => 52;
export const fd_close = () => 8;
export const fd_seek = fd_close;
export const fd_write = fd_close;
