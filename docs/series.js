/* Everything the page knows about the series. A new episode is one more entry here;
   a new season is one more object in `seasons` (tabs appear when there are two). */
window.SERIES = {
  repo: "https://github.com/gamedevpl/silnik3d-od-zera",
  playlist: "https://www.youtube.com/playlist?list=PLFf6J3zhiCW4",
  seasons: [
    { n:1, pl:{ t:"Sezon 1" }, en:{ t:"Season 1" }, episodes: [
  { n:0, slug:"e00", ep:"ep00", file:"frame.hpp", video:"kxuIFEB8rKk", short:"be0Yl4Wor2Y",
    at:"2026-12-02T17:00:00Z", shortAt:"2026-12-03T17:00:00Z", len:"19:20",
    pl:{ t:"Pierwsze okno", sum:"Puste main(), CMake i Ninja, GLFW i GLAD, okno OpenGL 3.3 core i tło, które pulsuje kolorem.",
         exT:"Przywróć puls tła", exP:"Kolor stanął. Uruchom puls tła w <code>frame.hpp</code>. Po poprawce tło ma ściemnieć, rozjaśnić się i znów ściemnieć.",
         ch:[["0:00","Puste main()"],["1:55","CMake i Ninja"],["3:29","GLFW i GLAD"],["6:37","Prośba o OpenGL 3.3 core"],["10:28","Ładowanie funkcji OpenGL"],["12:20","Pierwsza klatka i pętla"],["15:35","Puls koloru"],["18:47","Twoja kolej"]] },
    en:{ t:"The First Window", sum:"An empty main(), CMake and Ninja, GLFW and GLAD, an OpenGL 3.3 core window, and a background that pulses with colour.",
         exT:"Make the background pulse again", exP:"The colour is stuck. Make the background pulse in <code>frame.hpp</code>. After the fix, the background should go dark, light, then dark again.",
         ch:[["0:00","Empty main()"],["1:55","CMake and Ninja"],["3:29","GLFW and GLAD"],["6:37","Asking for OpenGL 3.3 core"],["10:28","Loading OpenGL functions"],["12:20","First frame and the render loop"],["15:35","Making it pulse"],["18:47","Your turn"]] } },
  { n:1, slug:"e01", ep:"ep01", file:"clock.hpp", video:"m4CKHxsiZZw", short:"m9NnZidEtzc",
    at:"2026-12-02T17:00:00Z", shortAt:"2026-12-10T17:00:00Z", len:"16:21",
    pl:{ t:"Pętla gry i stały krok", sum:"Kwadrat, który skacze, i ten sam skok przy 30, 60 i 240 FPS. glScissor, prędkość i grawitacja, lądowanie i dlaczego liczba klatek zmieniała skok, dopóki fizyka nie dostała własnego stałego kroku 20 ms.",
         exT:"Ogranicz nadrabianie po długiej klatce", exP:"W <code>clock.hpp</code> ogranicz czas przyjmowany z jednej klatki do 250 ms. Po klatce trwającej 333 ms oczekujesz 12 kroków i 10 ms reszty.",
         ch:[["0:00","Kwadrat z glScissor"],["1:47","Ustawienie kwadratu"],["2:57","Skok: prędkość i grawitacja"],["6:18","Lądowanie"],["7:37","Czy FPS zmienia skok?"],["8:46","Stały krok czasu"],["11:40","Test zegara bez okna"],["13:50","Limit nadrabiania po przycięciu"],["14:30","Zegar wraca do gry"],["15:49","Twoja kolej"]] },
    en:{ t:"Game Loop and Fixed Timestep", sum:"A square that jumps, and the same jump at 30, 60 and 240 FPS. glScissor, velocity and gravity, landing, and why the frame rate changed the jump until physics got its own fixed 20 ms step.",
         exT:"Cap the catch-up after a long frame", exP:"In <code>clock.hpp</code>, cap the time accepted from one frame at 250 ms. After a 333 ms frame, expect 12 steps and a 10 ms remainder.",
         ch:[["0:00","A square with glScissor"],["1:47","Placing the square"],["2:57","Jump: velocity and gravity"],["6:18","Landing"],["7:37","Does FPS change the jump?"],["8:46","A fixed timestep"],["11:40","Testing the clock without a window"],["13:50","Capping catch-up after a stall"],["14:30","Clock back in the game"],["15:49","Your turn"]] } },
  { n:2, slug:"e02", ep:"ep02", file:"mesh.hpp", video:"9L4EntUchkk", short:"BF9KTyqnWgw",
    at:"2026-12-02T17:00:00Z", shortAt:"2026-12-18T17:00:00Z", len:"23:32",
    pl:{ t:"Kostka, obroty i gimbal lock", sum:"Skaczący kwadrat dostaje głębię. Osiem narożników, dwanaście krawędzi, stopnie i radiany, sterowanie yaw/pitch/roll, przypadek 90°, w którym dwa różne obroty dają ten sam wynik, i dlaczego kwaterniony z tych samych trzech kątów tego nie naprawiają.",
         exT:"Wyprostuj boczne krawędzie kostki", exP:"W <code>mesh.hpp</code> wyprostuj cztery boki między ramkami kostki. Zachowaj 12 krawędzi. Żółty narożnik 6 ma się łączyć z 2.",
         ch:[["0:00","Od kwadratu do kostki"],["0:42","Narożniki na ekranie"],["5:51","Obrót punktów"],["7:51","Krawędzie między ścianami"],["9:19","Stopnie i radiany"],["10:39","Sterowanie yaw, pitch, roll"],["15:09","Gimbal lock przy 90°"],["17:44","Kwaterniony z tych samych kątów"],["19:58","Jedna orientacja, lokalne osie"],["22:55","Dalej: trójkąty"],["23:00","Twoja kolej"]] },
    en:{ t:"A Cube, Rotations and Gimbal Lock", sum:"The jumping square gets depth. Eight corners, twelve edges, degrees vs radians, yaw/pitch/roll controls, the 90° case where two different turns give the same result, and why quaternions built from the same three angles don't fix it.",
         exT:"Straighten the side edges of the cube", exP:"In <code>mesh.hpp</code>, straighten the four sides between the two face loops. Keep all 12 edges. The yellow corner 6 should connect to corner 2.",
         ch:[["0:00","From square to cube"],["0:42","Plotting the corners"],["5:51","Rotating the points"],["7:51","Edges between the faces"],["9:19","Degrees vs radians"],["10:39","Yaw, pitch and roll controls"],["15:09","Gimbal lock at 90°"],["17:44","Quaternions from the same angles"],["19:58","One orientation, local axes"],["22:55","Next: triangles"],["23:00","Your turn"]] } },
      // Planned, not recorded yet: a title is enough. Add video, at, len, ch and the exercise when it is ready.
      { n:3, slug:"e03", pl:{ t:"Pierwsza pełna ściana" }, en:{ t:"The First Solid Face" } },
      { n:4, slug:"e04", pl:{ t:"Kamera i głębia" }, en:{ t:"Camera and Depth" } },
      { n:5, slug:"e05", pl:{ t:"Tekstura w ruchu" }, en:{ t:"Texture in Motion" } },
      { n:6, slug:"e06", pl:{ t:"Światło i materiał" }, en:{ t:"Light and Material" } },
      { n:7, slug:"e07", pl:{ t:"Siatka jako zasób" }, en:{ t:"Mesh as an Asset" } },
      { n:8, slug:"e08", pl:{ t:"Scena, która pamięta swoje obiekty" }, en:{ t:"A Scene That Remembers Its Objects" } }
    ] }
  ]
};
