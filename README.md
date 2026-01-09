# Turbo Typer: Multiverse Edition

Turbo Typer to dynamiczna gra edukacyjna do nauki szybkiego pisania, stworzona z myślą o dzieciach i młodzieży. Gra oferuje pełną immersję dzięki różnorodnym motywom graficznym, zaawansowanemu systemowi audio i angażującym mechanikom power-upów.

Projekt jest w pełni responsywny i działa offline, wykorzystując nowoczesne API przeglądarkowe.

## 🌟 Główne Funkcjonalności

### 🎨 4 Unikalne Motywy (Multiverse)
Każdy motyw zmienia nie tylko kolory, ale także czcionki, tła, animacje CSS oraz warstwę dźwiękową:
*   **Kosmiczna Przygoda (Space):** Broń statku przed asteroidami w przestrzeni sci-fi.
*   **W Świecie Zwierząt (Nature):** Spokojny motyw z odgłosami natury i organiczną paletą barw.
*   **Percy Jackson (Mythology):** Antyczny styl inspirowany mitologią grecką i serią książek.
*   **Harry Potter (Magic):** Magiczny klimat z "zaklętymi" czcionkami i efektami cząsteczkowymi.

### 🎵 Zaawansowany System Audio (Generative Music)
Gra nie korzysta z gotowych plików MP3. Cała warstwa audio jest generowana w czasie rzeczywistym przez **Web Audio API**:
*   **Generatywny Ambient:** Muzyka w tle tworzona jest proceduralnie w oparciu o skale muzyczne dopasowane do motywu (np. pentatonika molowa dla kosmosu, skala dorycka dla mitologii).
*   **Efekty Dźwiękowe (SFX):** Unikalne brzmienia dla każdego motywu (lasery, instrumenty dęte, metaliczne uderzenia, magiczne dzwonki).
*   **UI Feedback:** Dźwięki przy najechaniu myszką i klikaniu w menu.

### 🎮 Tryby Gry i Poziomy Trudności
*   **Słowa:** Klasyczny tryb spadających wyrazów.
*   **Pary:** Pisanie połączeń przymiotnik + rzeczownik (trudniejsze).
*   **Zdania:** Pisanie pełnych zdań zawierających ciekawostki edukacyjne.
*   **3 Poziomy Trudności:** Wpływają na prędkość spadania i gęstość spawnowania słów.
*   **Tryb Dokładności:** Opcjonalny tryb wymuszający poprawianie literówek (brak akceptacji błędnych wpisów).

### ⚡ Power-Upy i Bonusy
System losowania (RNG) przyznaje specjalne właściwości spadającym wyrazom:
*   ❤️ **Serce (Bonus Poziomu):** Raz na poziom pojawia się wyraz odnawiający życie (max 5).
*   🛡️ **Tarcza (1%):** Chroni przed utratą życia przez 10 sekund (efekt wizualny na krawędziach ekranu).
*   💣 **Bomba (5%):** Eksplozja niszcząca okoliczne wyrazy i dodająca punkty.
*   ✖️ **Mnożnik x2 (3%):** Podwaja zdobywane punkty przez 10 sekund.
*   ⏰ **Zegar/Zamrożenie (2%):** Zatrzymuje czas i spadające wyrazy na 5 sekund.

### ⌨️ Mechanika "Smart Input"
*   **Smart Backspace:** Przytrzymanie klawisza Backspace (>500ms) czyści cały wpisany tekst.
*   **Auto-Clear:** Jeśli pisany wyraz rozbije się o dno ekranu, bufor czyści się automatycznie (chyba że pasuje do innego wyrazu).
*   **Dynamiczna Przezroczystość:** Pole wpisywania staje się półprzezroczyste, gdy spadający wyraz przelatuje "pod nim", aby nie zasłaniać celu.

### 🏆 Progresja
*   **Lokalne Tabele Wyników:** Wyniki (High Scores) są zapisywane w `localStorage` osobno dla każdego motywu.
*   **Screen Shake:** Ekran trzęsie się przy utracie życia lub wybuchu bomby.
*   **System Cząsteczek:** Kolorowe eksplozje przy poprawnym wpisaniu lub zniszczeniu słowa.

---

## 🛠️ Technologie

*   **React 18** (Komponenty funkcyjne, Hooks: `useRef`, `useEffect`, `useState`)
*   **TypeScript** (Pełne typowanie propsów, stanów i logiki gry)
*   **Tailwind CSS** (Stylizacja, animacje, RWD)
*   **Vite** (Bundler, HMR)
*   **Web Audio API** (Synteza dźwięku)
*   **Canvas API** (nieużywane bezpośrednio, ale logika cząsteczek oparta na klatkach animacji `requestAnimationFrame`)

---

## 🚀 Uruchomienie Lokalne

Projekt jest skonfigurowany do pracy w środowisku Node.js.

### Wymagania
*   [Node.js](https://nodejs.org/) (Wersja 16 lub nowsza)

### Instrukcja

1.  **Zainstaluj zależności:**
    Otwórz terminal w folderze projektu i wpisz:
    ```bash
    npm install
    ```

2.  **Uruchom tryb deweloperski:**
    ```bash
    npm run dev
    ```
    Gra otworzy się automatycznie w domyślnej przeglądarce pod adresem `http://localhost:5173`.

3.  **Budowanie wersji produkcyjnej:**
    ```bash
    npm run build
    ```
    Pliki wynikowe znajdą się w folderze `dist`.

---

## 🌐 GitHub Pages Deployment

1.  **Ustaw poprawną bazę Vite (`base`) dla repozytorium:**
    W pliku `vite.config.ts` ustaw `base` na nazwę repozytorium, np. dla repo `Turbo-Typer`:
    ```ts
    export default defineConfig({
      base: '/Turbo-Typer/',
      // ...
    })
    ```

2.  **Włącz GitHub Pages w repozytorium:**
    W GitHub przejdź do **Settings → Pages** i w sekcji **Build and deployment** wybierz źródło **Deploy from a branch**. Wybierz gałąź `main` i folder `/docs` (to jedyna opcja obok `/` w UI GitHub Pages).

3.  **Zbuduj i opublikuj statyczne pliki:**
    Zbuduj projekt lokalnie — build zapisuje wynik do katalogu `docs/`:
    ```bash
    npm run build
    ```
    Następnie wykonaj commit + push. GitHub Pages będzie serwować statyczne pliki z `docs/` bez użycia GitHub Actions.

---

## 📂 Struktura Projektu

*   `index.tsx`: Punkt wejścia aplikacji.
*   `App.tsx`: Główny kontener zarządzający motywami i nawigacją.
*   `components/`:
    *   `StartScreen.tsx`: Menu główne, wybór motywu, opcje, tabela wyników.
    *   `GameEngine.tsx`: Serce gry – pętla renderowania, logika kolizji, input, power-upy.
    *   `GameOverScreen.tsx`: Ekran końcowy, zapisywanie wyników.
*   `services/`:
    *   `geminiService.ts`: Baza danych słów, par i zdań (tryb offline).
    *   `soundService.ts`: Syntezator dźwięku i silnik muzyki generatywnej.
*   `types.ts`: Definicje typów TypeScript.
