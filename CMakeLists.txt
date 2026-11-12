cmake_minimum_required(VERSION 3.20)
project(Engine LANGUAGES C CXX)
set(CMAKE_CXX_STANDARD 17)
add_executable(engine main.cpp)

add_library(glad STATIC vendor/glad/src/gl.c)
target_include_directories(glad PUBLIC vendor/glad/include)
target_link_libraries(engine PRIVATE glad)
