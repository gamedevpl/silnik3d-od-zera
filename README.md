# Silnik 3D w C++ od zera

Kod z sesji Gamedev.pl. Każdy odcinek rozwija jeden projekt.

## Budowanie

Potrzebujesz kompilatora C++17, CMake 3.20+ i Ninja. GLFW i GLAD znajdują się w katalogu `vendor/` wraz z licencjami. Na macOS potrzebne są Command Line Tools, a na Linuksie także pakiety deweloperskie systemu okienkowego obsługiwanego przez GLFW.

```sh
cmake -S . -B build -G Ninja
cmake --build build
./build/engine
```

Zamknij okno, aby zakończyć program. Nagrania powstały z kompilacji natywnej na macOS.
