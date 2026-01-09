import { Difficulty, GameMode, Theme } from "../types";

// --- DATA DICTIONARIES ---

const SPACE_WORDS = [
  "rakieta", "gwiazda", "księżyc", "słońce", "orbita", "kometa", "planeta", "niebo", "mars", "wenus",
  "jowisz", "saturn", "uran", "neptun", "pluton", "ziemia", "baza", "skafander", "tlen", "pilot",
  "radar", "start", "lądowanie", "silnik", "paliwo", "stacja", "kosmos", "galaktyka", "mgławica", "czarna dziura",
  "asteroidy", "meteoryt", "krater", "grawitacja", "próżnia", "teleskop", "satelita", "sonda", "łazik", "moduł",
  "załoga", "misja", "odliczanie", "przestrzeń", "wszechświat", "supernowa", "pulsar", "kwazar", "konstelacja", "zodiak",
  "barana", "byka", "bliźniąt", "raka", "lwa", "panny", "wagi", "skorpiona", "strzelca", "koziorożca",
  "wodnika", "ryb", "wielki wóz", "mały wóz", "gwiazdozbiór", "droga mleczna", "andromeda", "horyzont", "czasoprzestrzeń", "nasa",
  "esa", "spacex", "elon", "kopernik", "galileusz", "newton", "einstein", "teoria", "względność", "fizyka",
  "astronomia", "foton", "atom", "cząsteczka", "plazma", "promieniowanie", "widmo", "podczerwień", "ultrafiolet", "rentgen",
  "laser", "pole siłowe", "napęd", "nadświetlna", "warp", "teleport", "android", "cyborg", "robot", "komputer",
  "sztuczna", "inteligencja", "bateria", "panel", "słoneczny", "wiertło", "próbka", "skała", "pył", "pierścień",
  "atmosfera", "magnetosfera", "zorza", "polarna", "zaćmienie", "pełnia", "nów", "faza", "pływy", "ocean",
  "błękitna", "czerwona", "karzeł", "olbrzym", "neutrino", "akcelerator", "zderzacz", "hadronów", "kwant", "mechanika",
  "dynamika", "pęd", "masa", "energia", "prędkość", "światła", "rok świetlny", "parsec", "jednostka", "astronomiczna",
  "obcy", "ufo", "spodek", "cywilizacja", "sygnał", "kontakt", "wiadomość", "kod", "szyfr", "transmisja",
  "antena", "nadajnik", "odbiornik", "fala", "częstotliwość", "zakłócenia", "szum", "cisza", "ciemność", "zimno",
  "izolacja", "właz", "śluza", "dokowanie", "manewr", "korekta", "kurs", "nawigacja", "mapa", "kompas",
  "żyroskop", "silniczek", "ster", "pokład", "kapitan", "oficer", "inżynier", "lekarz", "naukowiec", "biolog"
];

const ANIMAL_WORDS = [
  "kot", "pies", "lew", "tygrys", "słoń", "żyrafa", "małpa", "zebra", "koń", "krowa",
  "świnia", "kura", "kaczka", "gęś", "indyk", "owca", "koza", "baran", "wilk", "lis",
  "niedźwiedź", "zając", "królik", "mysz", "szczur", "chomik", "świnka", "morska", "papuga", "kanarek",
  "orzeł", "sokół", "jastrząb", "sowa", "dzięcioł", "wróbel", "gołąb", "kruk", "wrona", "sroka",
  "bocian", "żuraw", "czapla", "łabędź", "pelikan", "mewa", "rybitwa", "pingwin", "foka", "mors",
  "wieloryb", "delfin", "rekin", "ośmiornica", "kalmar", "krab", "homar", "krewetka", "meduza", "rozgwiazda",
  "koral", "gąbka", "ryba", "pstrąg", "łosoś", "szczupak", "okoń", "karp", "węgorz", "płaszczka",
  "żaba", "ropucha", "jaszczurka", "wąż", "żmija", "zaskroniec", "boa", "pyton", "kobra", "krokodyl",
  "aligator", "żółw", "kameleon", "legwan", "gekon", "dinozaur", "tyranozaur", "mamut", "tygrysszablozębny", "mrówka",
  "pszczoła", "osa", "szerszeń", "bąk", "trzmiel", "motyl", "ćma", "komar", "mucha", "ważka",
  "biedronka", "chrząszcz", "żuk", "pająk", "skorpion", "kleszcz", "pchła", "wsza", "glizda", "dżdżownica",
  "ślimak", "małż", "ostryga", "perła", "las", "dżungla", "sawanna", "pustynia", "tundra", "tajga",
  "step", "łąka", "pole", "ogród", "park", "drzewo", "krzew", "kwiat", "trawa", "mech",
  "grzyb", "paproć", "dąb", "sosna", "świerk", "jodła", "brzoza", "wierzba", "klon", "lipa",
  "kasztan", "orzech", "buk", "grab", "topola", "jesion", "olcha", "cis", "jarzębina", "bez",
  "róża", "tulipan", "narcyz", "stokrotka", "fiołek", "mak", "chaber", "rumianek", "mniszek", "pokrzywa",
  "korzeń", "łodyga", "liść", "pąk", "owoc", "nasiono", "szyszka", "igła", "kora", "drewno"
];

const PERCY_WORDS = [
  "zeus", "hera", "poseidon", "hades", "ares", "atena", "apollo", "artemis", "hefajstos", "afrodyta",
  "hermes", "dionizos", "demeter", "hestia", "kronos", "tytan", "gigant", "cyklop", "minotaur", "meduza",
  "chimera", "hydra", "cerber", "sfinks", "gryf", "pegaz", "centaur", "satyr", "nimfa", "driada",
  "syrena", "harpie", "furia", "mojry", "heros", "półbóg", "percy", "jackson", "annabeth", "grover",
  "luke", "chiron", "obóz", "herosów", "miecz", "tarcza", "włócznia", "łuk", "strzała", "sztylet",
  "zbroja", "hełm", "olimp", "podziemie", "tartar", "elizjum", "styks", "lete", "labirynt", "dedal",
  "ikar", "herakles", "achilles", "odys", "jason", "tezeusz", "perseusz", "orfeusz", "prometeusz", "atlas",
  "niektar", "ambrozja", "runy", "przepowiednia", "wyrocznia", "delfy", "klątwa", "błyskawica", "trójząb", "piorun",
  "woda", "morze", "fala", "sztorm", "burza", "trzęsienie", "ziemi", "ogień", "kuźnia", "mądrość",
  "wojna", "pokój", "miłość", "piękno", "muzyka", "poezja", "słońce", "księżyc", "łowy", "las",
  "natura", "wino", "impreza", "złodziej", "posłaniec", "podróż", "misja", "zadanie", "potwór", "walka",
  "pojededynek", "arena", "zwycięstwo", "chwała", "honor", "odwaga", "strach", "śmierć", "życie", "przeznaczenie",
  "złote", "runo", "statek", "argo", "żagiel", "wiosło", "mapa", "kompas", "skarb", "trofeum",
  "ofiara", "ołtarz", "świątynia", "kolumna", "posąg", "rzeźba", "obraz", "fresk", "mozaika", "waza",
  "amfora", "drachma", "złoto", "srebro", "brąz", "spiż", "żelazo", "stal", "kamień", "marmur",
  "grecja", "rzym", "łacina", "greka", "alfabet", "omega", "alfa", "delta", "sigma", "pi"
];

const POTTER_WORDS = [
  "harry", "ron", "hermiona", "draco", "snape", "dumbledore", "voldemort", "hagrid", "syriusz", "lupin",
  "mcgonagall", "ginny", "fred", "george", "neville", "luna", "zgredek", "hedwiga", "kły", "nagini",
  "hogwart", "zamek", "szkoła", "magia", "czary", "różdżka", "zaklęcie", "urok", "klątwa", "eliksir",
  "kociołek", "miotła", "nimbus", "błyskawica", "quidditch", "znicz", "tłuczek", "kafel", "szukający", "obrońca",
  "pałkarz", "ścigający", "boisko", "puchar", "dom", "gryffindor", "slytherin", "hufflepuff", "ravenclaw", "tiara",
  "przydziału", "dormitorium", "wieża", "lochy", "sala", "wielka", "błonia", "las", "zakazany", "jezioro",
  "chatka", "ekspres", "peron", "londyn", "nokturn", "pokątna", "gringott", "bank", "galeon", "sykl",
  "knut", "sklep", "ollivander", "sowy", "list", "koperta", "pergamin", "pióro", "atrament", "mapa",
  "huncwotów", "peleryna", "niewidka", "kamień", "filozoficzny", "komnata", "tajemnic", "więzień", "azkaban", "czara",
  "ognia", "zakon", "feniksa", "książę", "półkrwi", "insygnia", "śmierci", "horkruks", "dziennik", "pierścień",
  "medalion", "czarka", "diadem", "wąż", "bazyliszek", "pająk", "aragog", "wilkołak", "wampir", "troll",
  "goblin", "skrzat", "domowy", "duch", "upiur", "dementor", "patronus", "jeleń", "wydra", "pies",
  "łania", "łabędź", "feniks", "smok", "jajo", "turniej", "trójmagiczny", "bal", "szata", "mundurek",
  "prefekt", "nauczyciel", "dyrektor", "minister", "magii", "auror", "śmierciożerca", "mrok", "znak", "blizna",
  "czoło", "okulary", "chłopiec", "wybraniec", "przepowiednia", "kula", "wróżbiarstwo", "zielarstwo", "transmutacja", "historia"
];

// --- PAIRS (ADJECTIVE + NOUN or NOUN + NOUN) ---
const SPACE_PAIRS = [
  "start rakiety", "czarna dziura", "wielki wóz", "droga mleczna", "jasna gwiazda", "zimny księżyc", "nowa planeta", "obcy statek",
  "szybka sonda", "mały łazik", "gwiezdny pył", "faza księżyca", "czerwony mars", "pierścień saturna", "błękitna ziemia", "stacja kosmiczna",
  "skafaander astronauty", "lot w kosmos", "brak tlenu", "silnik rakietowy", "paliwo jądrowe", "baza księżycowa", "pełnia księżyca", "zaćmienie słońca",
  "wielki wybuch", "prędkość światła", "rok świetlny", "pole siłowe", "promień lasera", "atak klonów", "imperium kontratakuje", "powrót jedi",
  "ciemna materia", "biały karzeł", "czerwony olbrzym", "gwiazda polarna", "układ słoneczny", "planeta karłowata", "pas asteroid", "ogon komety",
  "deszcz meteorytów", "sztuczny satelita", "kosmiczny śmieć", "stan nieważkości", "grawitacja ziemi", "ciężki skafander", "złoty hełm", "moduł lądownika",
  "centrum kontroli", "odliczanie startu", "trzy dwa jeden", "zapłon silnika", "gwiezdne wojny", "star trek", "strażnicy galaktyki", "zielony ufoludek",
  "latający spodek", "tajna baza", "strefa pięćdziesiąt", "sygnał radiowy", "wiadomość z kosmosu", "pierwszy kontakt", "obca cywilizacja", "planeta małp"
];

const ANIMAL_PAIRS = [
  "szary wilk", "rudy lis", "wielki słoń", "długa żyrafa", "szybki gepard", "wolny żółw", "mała mysz", "czarny kot",
  "wierny pies", "biały koń", "dzika kaczka", "mądra sowa", "dumny orzeł", "kolorowa papuga", "zimna ryba", "groźny rekin",
  "wielki wieloryb", "sprytna małpa", "leniwy leniwiec", "pracowita mrówka", "królowa pszczół", "pajęcza sieć", "zielona żaba", "śliski wąż",
  "twarda skorupa", "miękkie futro", "ostre pazury", "długi ogon", "mokry nos", "wielkie uszy", "gęsty las", "zielona dżungla",
  "gorąca pustynia", "suchy piasek", "wysoka trawa", "piękny kwiat", "stare drzewo", "gruba kora", "zielony liść", "słodki owoc",
  "kwaśna cytryna", "czerwone jabłko", "żółty banan", "leśna ścieżka", "śpiew ptaków", "ryyk lwa", "wycie wilka", "brzęczenie muchy",
  "skok zająca", "bieg konia", "lot ptaka", "pływanie ryby", "pełzanie węża", "wspinaczka małpy", "polowanie tygrysa", "ucieczka antylopy",
  "stado owiec", "wataha wilków", "łavica ryb", "rój pszczół", "gniazdo ptaka", "nora lisa", "jaskinia niedźwiedzia", "dziupla wiewiórki"
];

const PERCY_PAIRS = [
  "syn posejdona", "córka ateny", "piorun zeusa", "trójząb neptuna", "miecz z brązu", "tarcza egida", "hełm mroku", "skrzydlate buty",
  "czapka niewidka", "złote runo", "obóz herosów", "wielka przepowiednia", "klątwa tytana", "bitwa o labirynt", "ostatni olimpijczyk", "morze potworów",
  "złodziej pioruna", "gniew bogów", "góra olimp", "boski nektar", "słodka ambrozja", "grecki ogień", "koń trojański", "nić ariadny",
  "skrzydła ikara", "lot dedala", "siła heraklesa", "pięta achillesa", "spryt odysa", "wyprawa argonautów", "piękna afrodyta", "mądra atena",
  "szybki hermes", "okrutny ares", "władca podziemi", "bóg wojny", "bogini łowów", "bóg słońca", "bóg kowali", "bogini miłości",
  "władca mórz", "król bogów", "stary chiron", "młody heros", "walka na miecze", "rzut oszczepem", "strzał z łuku", "wyścig rydwanów",
  "zdobycie flagi", "ognisko obozowe", "domek herosów", "wyrocznia delficka", "tajna misja", "wielki potwór", "straszna meduza", "jadowity wąż",
  "trzygłowy pies", "jednooki cyklop", "pół człowiek", "pół koń", "pół koza", "dzika natura", "święty gaj", "boski znak"
];

const POTTER_PAIRS = [
  "harry potter", "kamień filozoficzny", "komnata tajemnic", "więzień azkabanu", "czara ognia", "zakon feniksa", "książę półkrwi", "insygnia śmierci",
  "zloty znicz", "czarna różdżka", "latająca miotła", "czapka niewidka", "mapa huncwotów", "peron dziewięć", "ekspres hogwart", "wielka sala",
  "zakazany las", "chatka hagrida", "pokój życzeń", "ministerstwo magii", "ulica pokątna", "bank gringotta", "sklep weasleyów", "trzy miotły",
  "dziurawy kocioł", "wierzba bijąca", "jezioro hogwartu", "wieża gryffindoru", "lochy slytherinu", "piwnica hufflepuffu", "wieża ravenclawu", "dumbledore dyrektor",
  "profesor snape", "lord voldemort", "czarny pan", "śmierciożercy atakują", "gwardia dumbledora", "lekcja eliksirów", "obrona przed", "czarną magią",
  "opieka nad", "magicznymi stworzeniami", "historia magii", "transmutacja zwierząt", "zaklęcie patronusa", "mroczny znak", "zielony błysk", "czerwone iskry",
  "skrzat domowy", "wolny zgredek", "sowa hedwiga", "szczur parszywek", "kot krzywołap", "ropucha nevillea", "dyniowy pasztecik", "fasolki wszystkich",
  "smaków bertiego", "czekoladowa żaba", "piwo kremowe", "sok z dyni", "turniej trójmagiczny", "bal bożonarodzeniowy", "tiara przydziału", "miecz gryffindora"
];

// --- SENTENCES (SIMPLE & EDUCATIONAL) ---
const SPACE_SENTENCES = [
  "ziemia krąży wokół słońca", "księżyc świeci w nocy", "rakieta leci w kosmos", "gwiazdy migoczą na niebie", "astronauta nosi biały skafander",
  "słońce jest bardzo gorące", "mars to czerwona planeta", "jowisz jest największą planetą", "saturn ma piękne pierścienie", "grawitacja trzyma nas na ziemi",
  "teleskop służy do oglądania gwiazd", "nasa bada przestrzeń kosmiczną", "czarna dziura pochłania światło", "meteoryty spadają na ziemię", "kometa ma długi ogon",
  "na księżycu są kratery", "pierwszy człowiek na księżycu", "stacja kosmiczna okrąża ziemię", "łazik jeździ po marsie", "start rakiety jest głośny",
  "w kosmosie nie ma powietrza", "astronauci jedzą specjalne jedzenie", "statek kosmiczny ma silniki", "ufo to niezidentyfikowany obiekt", "kosmici mogą istnieć",
  "galaktyka to zbiór gwiazd", "droga mleczna to nasza galaktyka", "słońce wschodzi na wschodzie", "słońce zachodzi na zachodzie", "nocą jest ciemno i zimno",
  "wszechświat jest nieskończony", "naukowcy szukają życia w kosmosie", "planety krążą po orbitach", "satelita przesyła sygnał tv", "gps działa dzięki satelitom",
  "pilot steruje statkiem kosmicznym", "odliczanie do startu trwa", "trzy dwa jeden start", "rakieta przebija atmosferę", "widok ziemi z kosmosu",
  "błękitna planeta jest piękna", "musimy dbać o naszą planetę", "kosmos jest pełen tajemnic", "chcę zostać astronautą", "lubię oglądać gwiazdy",
  "wielki wóz łatwo znaleźć", "gwiazda polarna wskazuje północ", "zaćmienie słońca jest rzadkie", "pełnia księżyca rozświetla noc", "kosmiczna przygoda czeka nas"
];

const ANIMAL_SENTENCES = [
  "pies to najlepszy przyjaciel", "koty lubią pić mleko", "krowa daje nam mleko", "kura znosi smaczne jajka", "koń biega bardzo szybko",
  "ptaki latają wysoko w chmurach", "ryby pływają w czystej wodzie", "wieloryb to największe zwierzę", "słoń ma długą trąbę", "żyrafa ma długą szyję",
  "lew jest królem dżungli", "tygrys ma paski na futrze", "zebra jest biała w paski", "małpy lubią jeść banany", "wiewiórka zbiera orzechy na zimę",
  "niedźwiedź śpi w zimie", "pszczoły robią słodki miód", "motyle mają kolorowe skrzydła", "pająk tka swoją sieć", "mrówki są bardzo pracowite",
  "las jest domem zwierząt", "drzewa dają nam tlen", "kwiaty pachną bardzo ładnie", "trawa jest zielona i miękka", "lubię spacery po lesie",
  "trzeba szanować przyrodę", "nie wolno śmiecić w lesie", "woda jest potrzebna do życia", "słońce ogrzewa ziemię", "deszcz podlewa rośliny",
  "wiosną wszystko budzi się", "latem jest ciepło i słonecznie", "jesienią liście spadają z drzew", "zimą pada biały śnieg", "zwierzęta potrzebują naszej pomocy",
  "mam w domu małego psa", "chomik biega w kółku", "papuga potrafi powtarzać słowa", "rybki w akwarium są kolorowe", "mój kot głośno mruczy",
  "sowa poluje w nocy", "dzięcioł stuka w drzewo", "bocian przylatuje na wiosnę", "żaby kumkają w stawie", "ślimak nosi swój dom",
  "żółw porusza się wolno", "zając ma długie uszy", "lis jest sprytny i rudy", "wilk wyje do księżyca", "natura jest piękna i dzika"
];

const PERCY_SENTENCES = [
  "zeus włada niebem i piorunami", "posejdon jest władcą mórz", "hades rządzi w podziemiu", "atena to bogini mądrości", "ares lubi wojny i walkę",
  "percy jackson jest herosem", "annabeth jest córką ateny", "grover to zabawny satyr", "chiron uczy w obozie", "obóz herosów to dom",
  "herosi walczą z potworami", "miecz percego to orkan", "tytani chcą zniszczyć olimp", "bogowie mieszkają na olimpie", "meduza zamienia w kamień",
  "minotaur ma głowę byka", "pegaz to skrzydlaty koń", "centaur to pół koń", "satyr ma kozie nogi", "cyklop ma jedno oko",
  "złote runo leczy wszystko", "labirynt jest pełen pułapek", "wyrocznia przepowiada przyszłość", "herkules wykonał dwanaście prac", "ikara zgubiła pycha",
  "dedal zbudował labirynt", "prometeusz dał ludziom ogień", "puszka pandory kryje zło", "koń trojański był podstępem", "odyseusz długo wracał do domu",
  "achilles był wielkim wojownikiem", "grecja to piękny kraj", "starożytne mity są ciekawe", "bogowie piją nektar", "ambrozja to pokarm bogów",
  "styks to rzeka w podziemiu", "charon przewozi dusze zmarłych", "trójząb to broń posejdona", "piorun to broń zeusa", "tarcza egida budzi strach",
  "herosi mają dysleksję i adhd", "to pomaga im w walce", "potwory wyczuwają herosów", "mgła ukrywa magiczny świat", "zwykli ludzie nie widzą magii",
  "walka o sztandar to gra", "ognisko pali się w obozie", "składamy ofiary bogom", "każdy bóg ma swój domek", "przeznaczenie herosa jest trudne"
];

const POTTER_SENTENCES = [
  "harry potter to czarodziej", "hogwart to szkoła magii", "uczniowie mają swoje różdżki", "tiara przydziału wybiera dom", "gryffindor to dom odważnych",
  "slytherin to dom sprytnych", "ravenclaw to dom mądrych", "hufflepuff to dom wiernych", "dumbledore jest dyrektorem szkoły", "voldemort to czarny pan",
  "harry ma bliznę na czole", "ron jest przyjacielem harrego", "hermiona jest bardzo mądra", "hagrid jest gajowym w szkole", "hedwiga to sowa harrego",
  "quidditch to sport czarodziejów", "szukający łapie złoty znicz", "miotła służy do latania", "zaklęcie otwiera drzwi", "eliksir może zmienić wygląd",
  "peleryna niewidka ukrywa nas", "mapa huncwotów pokazuje wszystko", "zgredek jest wolnym skrzatem", "patronus chroni przed dementorami", "dementorzy wysysają radość",
  "zakazany las jest niebezpieczny", "na błoniach stoi wierzba bijąca", "ekspres do hogwartu odjeżdża", "peron dziewięć i trzy czwarte", "listy przynoszą sowy",
  "wielka sala jest magiczna", "sufit wygląda jak niebo", "duchy latają po zamku", "iryt poltergeist robi żarty", "obrazy w hogwarcie się ruszają",
  "schody zmieniają swoje położenie", "hasło otwiera portret grubiej damy", "turniej trójmagiczny jest trudny", "smoki są bardzo groźne", "bazyliszek to wielki wąż",
  "feniks odradza się z popiołów", "łzy feniksa leczą rany", "kamień filozoficzny daje życie", "komnata tajemnic została otwarta", "dziedzic slytherina powrócił",
  "nauczyciele uczą nas czarów", "snape uczy eliksirów", "mcgonagall uczy transmutacji", "lupin uczy obrony", "magia jest wszędzie wokół nas"
];

const DICTIONARIES = {
  space: {
    words: SPACE_WORDS,
    pairs: SPACE_PAIRS,
    sentences: SPACE_SENTENCES
  },
  animals: {
    words: ANIMAL_WORDS,
    pairs: ANIMAL_PAIRS,
    sentences: ANIMAL_SENTENCES
  },
  percy: {
    words: PERCY_WORDS,
    pairs: PERCY_PAIRS,
    sentences: PERCY_SENTENCES
  },
  potter: {
    words: POTTER_WORDS,
    pairs: POTTER_PAIRS,
    sentences: POTTER_SENTENCES
  }
};

// --- HELPER ---

const shuffleArray = (array: string[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// --- SERVICE ---

export const fetchWords = (difficulty: Difficulty, mode: GameMode, theme: Theme, count: number = 20): string[] => {
  const themeData = DICTIONARIES[theme];
  if (!themeData) {
      console.error(`Theme ${theme} not found, using Space fallback`);
      return shuffleArray(DICTIONARIES['space'].words).slice(0, count);
  }

  let sourceList: string[] = [];
  
  switch(mode) {
      case 'words':
          sourceList = themeData.words;
          break;
      case 'pairs':
          sourceList = themeData.pairs;
          break;
      case 'sentences':
          sourceList = themeData.sentences;
          break;
      default:
          sourceList = themeData.words;
  }

  // Shuffle and return requested amount
  return shuffleArray(sourceList).slice(0, count);
};