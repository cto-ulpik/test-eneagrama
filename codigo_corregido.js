const wrapper = document.getElementById("eneagram-test-wrapper");
if (!wrapper) {
  console.error("Contenedor principal #eneagram-test-wrapper no encontrado.");
  // return eliminado, no debe estar fuera de función
}

const quizContainer = wrapper.querySelector("#quiz-container");
const quizForm = wrapper.querySelector("#quiz-form");
const resultsTextDiv = wrapper.querySelector("#results-text");
const resultsContainer = wrapper.querySelector("#results-container");
const alertMessageDiv = wrapper.querySelector("#alert-message");
const paginationControlsDiv = wrapper.querySelector("#pagination-controls");
const submitBtn = wrapper.querySelector("#submit-btn");
const startTestContainer = wrapper.querySelector("#start-test-container");
const startTestBtn = wrapper.querySelector("#start-test-btn");
const typeDescriptions = wrapper.querySelectorAll(".type-description");
const restartTestBtn = wrapper.querySelector("#restart-test-btn"); // Corrección aquí
const emailFormContainer = wrapper.querySelector("#email-form-container");
let resultsChart = null;

// Verificar conexión de Firebase al inicio
function verificarConexionFirebase() {
  try {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      const db = firebase.firestore();
      console.log("🔥 Firebase inicializado correctamente");
      console.log("📊 Proyecto:", firebase.app().options.projectId);
      console.log("✅ Conexión a Firestore establecida");
      
      // Verificar permisos con una operación de lectura en la colección eneagrama
      db.collection('eneagrama').limit(1).get()
        .then(() => {
          console.log("✅ Permisos de lectura verificados en colección eneagrama");
          console.log("🎉 Firebase completamente funcional");
        })
        .catch((error) => {
          if (error.code === 'permission-denied') {
            console.error("❌ ERROR: Permisos de Firestore insuficientes");
            console.error("💡 Solución: Actualiza las reglas de Firestore para permitir escritura");
            console.error("📋 Reglas recomendadas:");
            console.error(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /eneagrama/{document} {
      allow read, write: if true;
    }
  }
}
            `);
      } else {
            console.warn("⚠️ Advertencia de permisos:", error.message);
          }
        });
        } else {
      console.error("❌ Firebase no está inicializado");
    }
  } catch (error) {
    console.error("❌ Error al verificar Firebase:", error);
  }
}

// Ejecutar verificación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  // Esperar un poco para que Firebase se inicialice completamente
  setTimeout(verificarConexionFirebase, 1000);
});

const numTypes = 9;

// --- PREGUNTAS (DEBES COMPLETARLAS CON 180) ---
// Array de objetos: { text: "Texto de la pregunta", type: (número del 1 al 9) }
// EJEMPLO CON POCAS PREGUNTAS - ¡RECUERDA PONER TUS 180 PREGUNTAS AQUÍ!
const allQuestionsData = [
  // Tipo 1 (Ejemplo: poner 20 preguntas por tipo para 180 totales)
  // 1 15 19 20 21 22 36 41 42 43 62 64 78 82 83 84 85 99 105 106 107
  //108 109 110 111 112 114 115 116  117  118 119 120 121 122 124  125
  { text: "Me esfuerzo por alcanzar la perfección en lo que hago.", type: 1 },
  { text: "Aprecio tener reglas que se espera que la gente siga.", type: 1 },
  {
    text: "Rara vez hay una buena razón para cambiar la forma en que se hacen las cosas.",
    type: 1,
  },
  { text: "Reviso cuidadosamente si hay errores y equivocaciones.", type: 1 },
  {
    text: "Paso tiempo intentando descubrir y corregir mis fallos y debilidades.",
    type: 1,
  },
  { text: "Tengo estándares muy altos para mí mismo", type: 1 },
  { text: "Me concentro en mis responsabilidades y deberes", type: 1 },
  { text: "Me presiono mucho para hacer las cosas bien.", type: 1 },
  { text: "Soy una persona responsable y confiable.", type: 1 },
  {
    text: "Todos tenemos un papel que desempeñar en la sociedad y el deber de hacer lo mejor que podamos.",
    type: 1,
  },
  {
    text: "La superación personal es uno de mis principales intereses.",
    type: 1,
  },
  {
    text: "¿A menudo me molesto porque las cosas no son como deberían ser?",
    type: 1,
  },
  { text: "¿No me gusta malgastar el tiempo?", type: 1 },
  {
    text: "¿Muchas veces me culpo a mi mismo por no hacer las cosas mejor?",
    type: 1,
  },
  { text: "¿Me cuesta relajarme y divertirme?", type: 1 },
  {
    text: "¿Pensamientos críticos de mi mismo y de otros, frecuentemente llenan mi cabeza ?",
    type: 1,
  },
  { text: "¿Me siento casi obligado a ser honesto?", type: 1 },
  { text: "¿Para mí es importante tener la razón?", type: 1 },
  { text: "¿Podría fácilmente ser, o soy una persona escrupulosa?", type: 1 },
  { text: "¿Me molesta de verdad algo que no sea justo?", type: 1 },

  // Tipo 2 (Ejemplo)
  //2 23 44 65 86 126 127 128 129 130 131 132 133 134 135 136 137 139 141 142 143 144 145
  { text: "Trabajo duro para ser útil a los demás.", type: 2 },
  {
    text: "Me gusta estar rodeado de personas a las que pueda ayudar.",
    type: 2,
  },
  {
    text: "Tomo la iniciativa para ayudar a otras personas y hacerles la vida más fácil.",
    type: 2,
  },
  { text: "Disfruto cuidando a los demás y sus necesidades.", type: 2 },
  { text: "¿Muchas personas dependen de mi ayuda y generosidad?", type: 2 },
  {
    text: "¿Me enorgullezco más de mi servicio a los demás que de ninguna otra cosa?",
    type: 2,
  },
  { text: "¿Necesito sentirme importante en la vida de los demás?", type: 2 },
  { text: "¿Muchas personas se sienten íntimas conmigo?", type: 2 },
  { text: "¿Regularmente halago a los demás ?", type: 2 },
  {
    text: "¿Me gusta rescatar a las personas, en dificultades o situaciones embarazosas?",
    type: 2,
  },
  {
    text: "¿Estoy casi impulsado a ayudar a otras personas, me guste o no?",
    type: 2,
  },
  {
    text: "¿Las personas frecuentemente se me acercan para recibir consejo o consuelo?",
    type: 2,
  },
  {
    text: "¿Muchas veces me siento sobrecargado por la dependencia de los demás en mi?",
    type: 2,
  },
  { text: "¿Pienso que no tengo muchas necesidades?", type: 2 },
  {
    text: "¿ A veces siento que los demás no me aprecian verdaderamente, a pesar de todo lo que hago por ellos?",
    type: 2,
  },
  { text: "¿Me gusta sentirme en intimidad con los demás?", type: 2 },
  {
    text: "¿Siento que debo ser la persona más importante en la vida de alguien debido a lo que he hecho por él?",
    type: 2,
  },
  {
    text: "¿Pienso que soy una persona que fomenta el crecimiento de los demás?",
    type: 2,
  },
  {
    text: "¿Cuándo tengo tiempo libre, frecuentemente lo paso ayudando a otros?",
    type: 2,
  },
  {
    text: "¿Me comunico con mis amigos más de lo que ellos se comunican conmigo?",
    type: 2,
  },
  // ... (continuar hasta 20 por tipo)

  // Tipo 3 ... (20 preguntas)
  //3 4 24 25 26 45 46 63 66 67 68 87 88 89 147  149 150 151 152 153 154 156 157 158  159 160 161 162 163 164 165
  { text: "Es importante para mí que le guste a otras personas.", type: 3 },
  { text: "Es importante para mí lograr grandes cosas.", type: 3 },
  {
    text: "¿Siento que necesito muchos logros antes que otras personas me tomen en cuenta?",
    type: 3,
  },
  { text: "¿Haría bien el trabajo de promocionar un proyecto?", type: 3 },
  {
    text: "Las organizaciones a las que pertenezco no funcionarían bien sin mí.",
    type: 3,
  },
  {
    text: "¿Tiendo a ser una persona asertiva (afirmar mi persona) y emprendedora?",
    type: 3,
  },
  { text: "Quiero lograr mucho en mi vida.", type: 3 },
  {
    text: "Leo libros que me ayudan a ser más productivo o mejor en lo que hago.",
    type: 3,
  },
  { text: "¿Creo que las apariencias son importantes?", type: 3 },
  { text: "Me fijé metas ambiciosas", type: 3 },
  {
    text: "¿Me choca que me digan que algo que estoy haciendo no sirve?",
    type: 3,
  },
  {
    text: "¿Generalmente prefiero involucrarme en el aspecto de la iniciativa de una operación, en vez de la continuación de la misma ?",
    type: 3,
  },
  {
    text: "¿La capacidad de organizar las cosas y realizarlas parece ser algo natural para mí?",
    type: 3,
  },
  { text: "¿Éxito es una palabra que significa mucho para mí ?", type: 3 },
  {
    text: "¿Me gusta tener metas claras y saber en que punto del camino hacia ellas me encuentro?",
    type: 3,
  },
  {
    text: "¿Me gustan los diagramas de progreso, las notas y otras evaluaciones de cómo voy?",
    type: 3,
  },
  { text: "¿Las otras personas envidian mucho lo que hago?", type: 3 },
  {
    text: "¿Mostrar una imagen de triunfador es muy importante para mí ?",
    type: 3,
  },
  {
    text: "¿Para tener éxito a veces tienes que olvidarte un poco de tus principios?",
    type: 3,
  },
  {
    text: "¿Al recordar mi pasado, tiendo a acordarme de lo que hice bien y correcto, en vez de lo que hice mal e incorrecto?",
    type: 3,
  },
  // Tipo 4 ... (20 preguntas)
  //5 6 7 18 27 28 34 39 48 49 60 69 70 81 91 166 167 168 169 170 171 172
  //173 174 175 176 177 178 179 180 181 183 184 185
  {
    text: "Hago contribuciones más significativas que la persona promedio.",
    type: 4,
  },
  { text: "Siento mis emociones muy profundamente.", type: 4 },
  {
    text: "Tengo la sensación de que otras personas nunca me entenderán verdaderamente",
    type: 4,
  },
  { text: "No encajo con la gente común.", type: 4 },
  { text: "¿Me gusta hacer las cosas bien y con clase ?", type: 4 },
  { text: "Siempre me he sentido diferente a las demás personas.", type: 4 },
  {
    text: "No dudo en llamar la atención a las personas cuando se portan mal.",
    type: 4,
  },
  {
    text: "¿Me gusta mucho el teatro y en mis fantasías me imagino que estoy en el escenario?",
    type: 4,
  },
  {
    text: "Siento un profundo sentimiento de dolor por lo que he perdido.",
    type: 4,
  },
  {
    text: "¿A veces temo que la manifestación de mis sentimientos no es suficiente?",
    type: 4,
  },
  { text: "¿El ambiente que me rodea es muy importante para mí?", type: 4 },
  {
    text: "Puedo describir mis emociones con mucha profundidad y detalle.",
    type: 4,
  },
  { text: "A menudo me siento como un extraño", type: 4 },
  {
    text: "Tengo intereses diferentes a los de la mayoría de la gente.",
    type: 4,
  },
  {
    text: "¿Parezco absorber fácilmente los sentimientos de un grupo, tanto así que frecuentemente no puedo diferenciar cuales son mis sentimientos y cuales los del grupo ?",
    type: 4,
  },
  {
    text: "¿La mayoría de las personas no aprecian la verdadera belleza de la vida?",
    type: 4,
  },
  { text: "¿Siento una nostalgia casi compulsiva por mi pasado?", type: 4 },
  { text: "¿Trato de parecer sencillo y natural?", type: 4 },
  {
    text: "Me encuentro oscilando entre altos y bajos. Estoy o eufórico o deprimido. No me siento con vida cuando estoy en equilibrio?",
    type: 4,
  },
  {
    text: "¿El arte y expresión artística son muy importantes para mí, como una forma de canalizar mis emociones?",
    type: 4,
  },

  // Tipo 5 ... (20 preguntas)
  //8 29 50 71 90 92 186 187 188 189 190 191 193 194 195 196 197 199 200 201 202
  { text: "Pienso profundamente en las cosas", type: 5 },
  { text: "Me gusta analizar las cosas desde todos los ángulos.", type: 5 },
  {
    text: "Me tomo tiempo para comprender las cosas más profundamente que la mayoría de la gente.",
    type: 5,
  },
  { text: "Encuentro que mi mente es un lugar muy interesante.", type: 5 },
  { text: "Rara vez tengo emociones fuertes.", type: 5 },
  {
    text: "Quiero aprender todo lo que pueda sobre cómo funciona el mundo.",
    type: 5,
  },
  { text: "¿Tiendo a no revelar mis sentimientos?", type: 5 },
  {
    text: "¿Guardo lo que tengo y recojo cosas que pueda necesitar algún día?",
    type: 5,
  },
  { text: "¿No sé cómo llevar una conversación ligera?", type: 5 },
  {
    text: "¿Intelectualmente me gusta sintetizar y reunir ideas diferentes?",
    type: 5,
  },
  {
    text: "¿Se me pone la mente en blanco cuando me siento avergonzado o cuando alguien me pregunta como me siento?",
    type: 5,
  },
  { text: "¿Necesito mucha privacidad, tiempo y espacio propio?", type: 5 },
  {
    text: "¿Muchas veces me encuentro como observador en vez de involucrarme?",
    type: 5,
  },
  { text: "¿Tiendo a ser un poco solitario?", type: 5 },
  { text: "¿Aparento ser más callado que la mayoría?", type: 5 },
  { text: "¿Me cuesta tender la mano o pedir algo que necesito?", type: 5 },
  {
    text: "¿Si surge un problema, me gusta resolverlo primero yo solo y luego discutirlo con los demás ?",
    type: 5,
  },
  {
    text: "¿Me choca cuando hago una mala compra (cuando no recibo el valor de mi dinero) ?",
    type: 5,
  },
  {
    text: "¿Me gusta poner las cosas en perspectiva para luego asimilarlas. Si se me escapa alguna cosa me culpo de ser simplista o ingenuo?",
    type: 5,
  },
  {
    text: "¿Tiendo a ser tacaño con mi tiempo, mi dinero y mi personal?",
    type: 5,
  },
  // Tipo 6 ... (20 preguntas)
  //9 16 17 30 37 38 51 57 58 59 72 79 80 93 100 101
  //113 207 208 209 210 211 212 213 214 215 216 217
  //218 219 220 221 222 223 224 225
  { text: "Estoy preparado para cualquier desastre.", type: 6 },
  { text: "Me preocupa la seguridad más que cualquier otra cosa.", type: 6 },
  { text: "Pienso mucho en lo que pasará en el futuro.", type: 6 },
  {
    text: "Siempre tengo un plan de lo que haría si las cosas salen mal.",
    type: 6,
  },
  {
    text: "Busco relaciones que me ofrezcan algún tipo de protección.",
    type: 6,
  },
  {
    text: "Puedo visualizar claramente lo que podría pasar en el futuro.",
    type: 6,
  },
  {
    text: "¿Muchas veces me pregunto si tendré el coraje para hacer algo que debo hacer?",
    type: 6,
  },
  {
    text: "Me siento más cómodo en organizaciones con una jerarquía clara.",
    type: 6,
  },
  {
    text: "Tomo medidas para protegerme a mí mismo y a mis seres queridos de cualquier daño.",
    type: 6,
  },
  { text: "¿Muchas veces me encuentro lleno de dudas?", type: 6 },
  {
    text: "¿Tiendo a actuar debido a un sentido del deber y responsabilidad?",
    type: 6,
  },
  {
    text: "Hago alianzas con personas que pueden ayudarme a mantenerme seguro y protegido.",
    type: 6,
  },
  {
    text: "¿Prefiero tener las cosas sujetas a un horario en vez de cuando sea ?",
    type: 6,
  },
  {
    text: "Es importante para mí entender qué puede salir mal en una situación.",
    type: 6,
  },
  { text: "Me preocupa proteger lo que tengo", type: 6 },
  {
    text: "¿Parece preocuparme más que a otras personas el defenderme a mí mismo y mi posición?",
    type: 6,
  },
  { text: "¿Parezco preocuparme más que otras personas?", type: 6 },
  { text: "¿La lealtad a un grupo es muy importante para mí?", type: 6 },
  {
    text: "¿Me cuesta mucho ir en contra de lo que dice la autoridad?",
    type: 6,
  },
  {
    text: "¿Antes de tomar una decisión, busco información adicional para asegurarme que estoy preparado?",
    type: 6,
  },
  // Tipo 7 ... (20 preguntas)
  //10 11 12 32 33 52 53 54 73 74 75 94 95 96 103 227
  //228 229 230 231 232 233 234 235 237 238 239 240 241 242 243 244 245
  {
    text: "Para mí es importante evitar el dolor y el sufrimiento en todo momento.",
    type: 7,
  },
  {
    text: "Busco experiencias que sé que me harán sentir feliz o emocionado.",
    type: 7,
  },
  { text: "Veo lo positivo en cada situación.", type: 7 },
  { text: "¿Me caen bien casi todas las personas que conozco?", type: 7 },
  {
    text: "Soy bueno viendo el lado positivo de las cosas cuando otros se quejan.",
    type: 7,
  },
  {
    text: "Me distraigo de cualquier sentimiento triste que surja.",
    type: 7,
  },
  {
    text: "A menudo hago cambios en mi vida cuando las cosas se vuelven aburridas.",
    type: 7,
  },
  { text: "Tiendo a ser más optimista que la mayoría de la gente.", type: 7 },
  {
    text: "Tengo muchas formas de evitar situaciones que me deprimen.",
    type: 7,
  },
  {
    text: "¿Me gusta contar cuentos, chistes, anécdotas graciosas?",
    type: 7,
  },
  { text: "¿Mi teoría es Si algo es bueno, más es mejor?", type: 7 },
  {
    text: "Tomo medidas para asegurarme de no sentirme triste o solo.",
    type: 7,
  },
  { text: "Probar cosas nuevas hace que la vida sea interesante", type: 7 },
  { text: "Soy una persona optimista", type: 7 },
  {
    text: "Pruebo nuevas formas de hacer las cosas sólo para ver si funcionan.",
    type: 7,
  },
  {
    text: "¿Hay muy pocas cosas en la vida de las cuales no puedo disfrutar?",
    type: 7,
  },
  {
    text: "¿No pienso que sea bueno estar triste por mucho tiempo?",
    type: 7,
  },
  {
    text: "¿Me gustaría que los demás tomaran las cosas menos en serio?",
    type: 7,
  },
  { text: "¿Me gusta ser considerado una persona alegre?", type: 7 },
  { text: "¿Recuerdo a mi niñez como un tiempo feliz ?", type: 7 },
  // Tipo 8 ... (20 preguntas)
  //13 55 76 97 104 246 247 248 249 250 251 252 253 254  256 257 259 260 261 262
  {
    text: "No tengo miedo de decirle a alguien cuando creo que está equivocado.",
    type: 8,
  },
  {
    text: "Le digo a la gente lo que pienso, aunque sea difícil escucharlo.",
    type: 8,
  },
  {
    text: "Defiendo lo que creo, incluso si eso molesta a otras personas.",
    type: 8,
  },
  {
    text: "Generalmente soy yo quien toma una posición cuando otros no lo hacen.",
    type: 8,
  },
  { text: "Tengo mucha fuerza de voluntad.", type: 8 },
  {
    text: "¿Soy muy bueno defendiendo y peleando por lo que deseo?",
    type: 8,
  },
  {
    text: "¿Me doy cuenta rápidamente del punto débil de los demás y los toco en el cuando me provocan?",
    type: 8,
  },
  { text: "¿Me es fácil expresar mi descontento con las cosas?", type: 8 },
  { text: "¿No temo confrontar a las personas y lo hago?", type: 8 },
  { text: "¿Gozo ejerciendo autoridad, poder?", type: 8 },
  {
    text: "¿Tengo un sexto sentido de donde reside el poder de un grupo?",
    type: 8,
  },
  { text: "¿Soy una persona agresiva, dogmática y auto asertiva?", type: 8 },
  { text: "¿Sé como hacer que se hagan las cosas?", type: 8 },
  {
    text: "¿Me cuesta aceptar y expresar mi lado tierno, gentil, suave, femenino?",
    type: 8,
  },
  { text: "¿La justicia e injusticia son puntos claves para mí?", type: 8 },
  {
    text: "¿Protejo a las personas que están bajo mi autoridad o jurisdicción?",
    type: 8,
  },
  {
    text: "¿Generalmente, no me atrae mucho la introspección o demasiado auto análisis?",
    type: 8,
  },
  { text: "¿Me considero una persona no conformista?", type: 8 },
  { text: "¿No me gusta que me acorralen?", type: 8 },
  { text: "¿No me gusta que me digan que debo adaptarme?", type: 8 },

  // Tipo 9 ... (20 preguntas)
  //14 35 40 56 61 77 98 102 204 205 206 226 263 265
  //266 267 268 269 270 271 272 273 274 275 276 277 278 279 280 281 282 283 284 285
  { text: "Dejo que otras personas tomen las decisiones", type: 9 },
  { text: "Estoy de acuerdo con lo que quieren los demás", type: 9 },
  { text: "Me gusta hacer las cosas como siempre las he hecho.", type: 9 },
  {
    text: "Prefiero seguir al grupo que esforzarme por conseguir lo que quiero.",
    type: 9,
  },
  { text: "No me gusta probar nuevos métodos o procedimientos.", type: 9 },
  { text: "Dejo que otras personas tomen la iniciativa", type: 9 },
  { text: "Otras personas tienen opiniones más fuertes que yo.", type: 9 },
  {
    text: "Soy una persona promedio con gustos y disgustos comunes.",
    type: 9,
  },
  {
    text: "¿Tengo un tono de voz suave y las personas a menudo me tienen que pedir que hable más alto?",
    type: 9,
  },
  { text: "¿Tiendo a ser más una persona que recibe a una que dá?", type: 9 },
  { text: "¿Básicamente, soy una persona común y corriente?", type: 9 },
  {
    text: "¿Parezco sospechar menos de las personas y sus motivos que los demás?",
    type: 9,
  },
  { text: "¿Me considero un buen trabajador?", type: 9 },
  { text: "¿Pienso que los demás se crean sus propios problemas?", type: 9 },
  {
    text: "¿La mayoría de las personas se agitan demasiado con las cosas?",
    type: 9,
  },
  {
    text: "¿La mayoría de las cosas en la vida, no merecen que uno se inquiete?",
    type: 9,
  },
  { text: "¿Casi siempre estoy tranquilo y calmado?", type: 9 },
  { text: "¿Me gusta tener tiempo para no hacer nada?", type: 9 },
  { text: "¿Soy una persona sumamente serena?", type: 9 },
  {
    text: "¿No me acuerdo cuando fue la última vez que tuve problemas para dormir?",
    type: 9,
  },
];
// Asegúrate de tener 20 preguntas por cada uno de los 9 tipos (total 180)

const typeColors = [
  "#667eea", // Tipo 1 - Azul moderno
  "#f093fb", // Tipo 2 - Rosa vibrante
  "#4facfe", // Tipo 3 - Azul cielo
  "#764ba2", // Tipo 4 - Púrpura profundo
  "#43e97b", // Tipo 5 - Verde esmeralda
  "#fa709a", // Tipo 6 - Rosa coral
  "#fee140", // Tipo 7 - Amarillo dorado
  "#ff6b6b", // Tipo 8 - Rojo coral
  "#a8edea", // Tipo 9 - Verde menta
];
const typeLabels = [
  "El Perfeccionista", // Tipo 1
  "El Ayudador", // Tipo 2
  "El Triunfador", // Tipo 3
  "El Individualista", // Tipo 4
  "El Investigador", // Tipo 5
  "El Leal", // Tipo 6
  "El Entusiasta", // Tipo 7
  "El Desafiador", // Tipo 8
  "El Pacificador" // Tipo 9
];

const typeIcons = [
  "⚖️", // Tipo 1 - Balanza (justicia)
  "💖", // Tipo 2 - Corazón (ayuda)
  "🏆", // Tipo 3 - Trofeo (triunfo)
  "🎨", // Tipo 4 - Paleta (arte)
  "🔍", // Tipo 5 - Lupa (investigación)
  "🛡️", // Tipo 6 - Escudo (protección)
  "🌈", // Tipo 7 - Arcoíris (entusiasmo)
  "🔥", // Tipo 8 - Fuego (desafío)
  "🌿" // Tipo 9 - Hoja (paz)
];
const grayColor = "#CCCCCC";

let currentPage = 1;
const questionsPerPage = 20; // O 20 si prefieres menos páginas con 180 preguntas
let shuffledQuestions = [];
let userResponses = [];

// Test completo - 180 preguntas
const preguntasCompletas = 180;

const prevBtn = document.createElement("button");
prevBtn.type = "button";
prevBtn.id = "prev-btn";
prevBtn.textContent = "Anterior";
const nextBtn = document.createElement("button");
nextBtn.type = "button";
nextBtn.id = "next-btn";
nextBtn.textContent = "Siguiente";

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function initializeQuiz() {
  console.log("Inicializando quiz..."); // Depuración
  if (!quizContainer || !submitBtn || !paginationControlsDiv || !quizForm) {
    console.error("Faltan elementos esenciales del quiz en el DOM.");
    return;
  }

  // Inicializar preguntas y respuestas - test completo
  shuffledQuestions = [...allQuestionsData];
  shuffleArray(shuffledQuestions);
  console.log(`Test completo: ${allQuestionsData.length} preguntas`);
  
  userResponses = Array(shuffledQuestions.length).fill(null);

  // Mostrar el formulario y ocultar la pantalla inicial
  if (quizForm && startTestContainer) {
    quizForm.style.display = "block";
    startTestContainer.style.display = "none";
  }

  // Scroll al principio de la página
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Configurar controles de paginación
  if (paginationControlsDiv) {
    paginationControlsDiv.innerHTML = "";
    const pagBtnsWrapper = document.createElement("div");
    pagBtnsWrapper.style.display = "flex";
    pagBtnsWrapper.style.justifyContent = "space-between";
    pagBtnsWrapper.style.alignItems = "center";
    pagBtnsWrapper.style.gap = "10px";
    pagBtnsWrapper.appendChild(prevBtn);
    pagBtnsWrapper.appendChild(nextBtn);
    paginationControlsDiv.appendChild(pagBtnsWrapper);
    paginationControlsDiv.style.display = "block";
  }

  // Configurar botones de navegación
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderCurrentPage();
      updatePaginationButtons();
      // Scroll al principio de la página
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  nextBtn.addEventListener("click", async () => {
    if (!areCurrentPageQuestionsAnswered()) {
      showAlert(
        "Por favor, responde todas las preguntas de esta página antes de continuar.",
        "warning"
      );
      return;
    }

    // Solo avanzar a la siguiente página, no guardar aún

    const totalPages = Math.ceil(shuffledQuestions.length / questionsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderCurrentPage();
      updatePaginationButtons();
      // Scroll al principio de la página
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Renderizar primera página y actualizar botones
  renderCurrentPage();
  updatePaginationButtons();
}

function renderCurrentPage() {
  if (!quizContainer) return;
  
  const totalPages = Math.ceil(shuffledQuestions.length / questionsPerPage);
  const progressWidth = (currentPage / totalPages) * 100;
  
  quizContainer.innerHTML = `
    <div class="quiz-header">
      <div class="quiz-title">
        <div class="quiz-icon-container">
          <img src="media/icon_enea.png" alt="Eneagrama" class="quiz-icon">
      </div>
        <div class="quiz-title-text">
          <h2>Test de Motivación</h2>
          <p class="quiz-subtitle">Descubre tu tipo de motivación</p>
      </div>
      </div>
      <div class="quiz-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressWidth}%"></div>
        </div>
        <span class="progress-text">Página ${currentPage} de ${totalPages}</span>
      </div>
    </div>`;

  let startIdx, endIdx;
  
  // Usar paginación normal
    startIdx = (currentPage - 1) * questionsPerPage;
    endIdx = Math.min(startIdx + questionsPerPage, shuffledQuestions.length);

  for (let i = startIdx; i < endIdx; i++) {
    const question = shuffledQuestions[i];
    const questionDiv = document.createElement("div");
    questionDiv.className = "question question-card";
    questionDiv.id = `question-global-${i}`;

    // Número de pregunta
    const questionNumber = document.createElement("div");
    questionNumber.className = "question-number";
    questionNumber.textContent = `Pregunta ${i + 1}`;
    questionDiv.appendChild(questionNumber);

    const questionText = document.createElement("div");
    questionText.className = "question-text";
    questionText.textContent = question.text;
    questionDiv.appendChild(questionText);

    const optionsDiv = document.createElement("div");
    optionsDiv.className = "options-container";

    // Etiquetas de escala
    const scaleLabels = document.createElement("div");
    scaleLabels.className = "scale-labels";
    scaleLabels.innerHTML = `
      <span class="scale-label-left">Nada identificado</span>
      <span class="scale-label-right">Muy identificado</span>
    `;
    optionsDiv.appendChild(scaleLabels);

    // Contenedor de opciones
    const optionsWrapper = document.createElement("div");
    optionsWrapper.className = "options-wrapper";

    for (let value = 1; value <= 5; value++) {
      const label = document.createElement("label");
      label.className = "option-label";
      label.setAttribute("data-value", value);

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `question-${i}`;
      input.value = value;
      input.className = "option-input";

      const optionContent = document.createElement("div");
      optionContent.className = "option-content";

      // Icono visual mejorado
      const icon = document.createElement("div");
      icon.className = "option-icon";
      const icons = ["😞", "🙁", "😐", "🙂", "😃"];
      icon.textContent = icons[value - 1];
      optionContent.appendChild(icon);

      const number = document.createElement("div");
      number.className = "option-number";
      number.textContent = value;
      optionContent.appendChild(number);

      // Texto removido según solicitud del usuario

      label.appendChild(input);
      label.appendChild(optionContent);

      if (userResponses[i] === value) {
        input.checked = true;
        label.classList.add("selected");
      }

      input.addEventListener("change", () => {
        userResponses[i] = parseInt(input.value);
        
        // Remover selección de otras opciones
        document.querySelectorAll(`[name='question-${i}']`).forEach((el) => {
          el.parentElement.classList.remove("selected");
        });
        
        // Agregar selección a la opción actual
        label.classList.add("selected");
        
        hideAlert();
        updateSubmitButtonVisibility();
      });

      optionsWrapper.appendChild(label);
    }

    optionsDiv.appendChild(optionsWrapper);

    questionDiv.appendChild(optionsDiv);
    quizContainer.appendChild(questionDiv);
  }
  // Indicador inferior (footer)
  const footer = document.createElement("div");
  footer.className = "pagination-indicator";
  footer.style.marginTop = "15px";
  footer.style.fontWeight = "bold";
  footer.style.textAlign = "center"; // opcional
  footer.textContent = `Página ${currentPage}/${Math.ceil(
    shuffledQuestions.length / questionsPerPage
  )}`;
  quizContainer.appendChild(footer);
}

function updatePaginationButtons() {
  if (!prevBtn || !nextBtn || !submitBtn) return;

  // Mostrar botones de paginación y envío
    // Modo completo con paginación normal
  const totalPages = Math.ceil(shuffledQuestions.length / questionsPerPage);
  prevBtn.disabled = currentPage === 1;

    // Mostrar u ocultar el botón "Siguiente"
  if (currentPage === totalPages) {
    nextBtn.style.display = "none";
    submitBtn.style.display = "block";
    // Alinear los botones en la última página
    const pagBtnsWrapper = paginationControlsDiv.querySelector("div");
    if (pagBtnsWrapper && !pagBtnsWrapper.querySelector("#submit-btn")) {
      pagBtnsWrapper.innerHTML = "";
      pagBtnsWrapper.appendChild(prevBtn);
      pagBtnsWrapper.appendChild(submitBtn);
      prevBtn.style.display = "inline-block";
      submitBtn.style.display = "inline-block";
    }
  } else {
    // Restaurar los botones normales
    const pagBtnsWrapper = paginationControlsDiv.querySelector("div");
    if (pagBtnsWrapper) {
      pagBtnsWrapper.innerHTML = "";
      pagBtnsWrapper.appendChild(prevBtn);
      pagBtnsWrapper.appendChild(nextBtn);
      prevBtn.style.display = "inline-block";
      nextBtn.style.display = "inline-block";
    }
    submitBtn.style.display = "none";
  }
}

function areCurrentPageQuestionsAnswered() {
  let startIdx, endIdx;
  
  // Verificar solo la página actual
    startIdx = (currentPage - 1) * questionsPerPage;
    endIdx = Math.min(startIdx + questionsPerPage, shuffledQuestions.length);

  for (let i = startIdx; i < endIdx; i++) {
    if (userResponses[i] === null) {
      const questionDiv = wrapper.querySelector(`#question-global-${i}`);
      if (questionDiv) {
        questionDiv.style.borderColor = "red";
        questionDiv.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }
  }
  return true;
}

function updateSubmitButtonVisibility() {
  if (!submitBtn) return;

  const allAnswered = userResponses.every((response) => response !== null);
  
  // Mostrar el botón solo en la última página cuando todas estén respondidas
  if (
    allAnswered &&
    currentPage === Math.ceil(shuffledQuestions.length / questionsPerPage)
  ) {
    submitBtn.style.display = "block";
  } else {
    submitBtn.style.display = "none";
  }
}

function calculateScores() {
  if (userResponses.length !== shuffledQuestions.length) {
    console.error(
      `Longitud de respuestas (${userResponses.length}) no coincide con preguntas (${shuffledQuestions.length})`
    );
    showAlert("Error al procesar respuestas. Intenta recargar la página.");
    return null;
  }
  for (let i = 0; i < userResponses.length; i++) {
    if (userResponses[i] === null) {
      const pageOfMissingQuestion = Math.floor(i / questionsPerPage) + 1;
      currentPage = pageOfMissingQuestion;
      renderCurrentPage();
      updatePaginationButtons();
      setTimeout(() => {
        const missingQuestionDiv = wrapper.querySelector(
          `#question-global-${i}`
        );
        if (missingQuestionDiv) {
          missingQuestionDiv.style.borderColor = "red";
          missingQuestionDiv.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        showAlert(
          "Aún faltan preguntas por responder. Por favor, completa todas.",
          "warning"
        );
      }, 100);
      return null;
    }
  }
  hideAlert();

  const scores = Array(numTypes).fill(0);
  userResponses.forEach((responseValue, globalIndex) => {
    if (
      shuffledQuestions[globalIndex] &&
      typeof shuffledQuestions[globalIndex].type !== "undefined"
    ) {
      const originalType = shuffledQuestions[globalIndex].type;
      scores[originalType - 1] += responseValue;
    } else {
      console.error(
        `Pregunta indefinida o sin tipo en el índice global ${globalIndex}`
      );
    }
  });
  return scores;
}

function displayResults(scores) {
  if (
    !resultsTextDiv ||
    !resultsContainer ||
    !paginationControlsDiv ||
    !submitBtn ||
    !quizForm
  )
    return;

  // Guardar los scores para usar después
  window.calculatedScores = scores;

  // Ocultar el quiz
  paginationControlsDiv.style.display = "none";
  submitBtn.style.display = "none";
  quizForm.style.display = "none";
  
  // Mostrar el formulario de email en ambos modos
  if (emailFormContainer) {
    // Actualizar el texto según el modo
    const titleElement = document.getElementById("email-form-title");
    const descriptionElement = document.getElementById("email-form-description");
    const privacyElement = document.getElementById("privacy-note");
    
    // Configuración para test completo
    if (titleElement) {
      titleElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 1rem;">
          <img src="media/icon_enea.png" alt="Eneagrama" style="width: 40px; height: 40px;">
          <span>Para ver tus resultados</span>
        </div>
      `;
    }
      if (descriptionElement) descriptionElement.textContent = "Necesitamos tu email para enviarte un análisis personalizado de tu personalidad.";
      if (privacyElement) {
        privacyElement.innerHTML = '<em>Este test es personalizado para ti. Usamos tu correo solo para identificarte y mejorar tu experiencia. No compartimos tus datos.</em>';
    }
    
    emailFormContainer.style.display = "block";
    emailFormContainer.scrollIntoView({ behavior: "smooth" });
    
    // Verificar que el formulario existe después de mostrarlo
    setTimeout(() => {
      const emailFormCheck = document.getElementById("email-form");
      const submitBtnCheck = document.getElementById("submit-email-btn");
      console.log("🔍 Verificando formulario después de mostrarlo:");
      console.log("emailFormCheck:", !!emailFormCheck);
      console.log("submitBtnCheck:", !!submitBtnCheck);
      console.log("Modo: Test Completo");
    }, 100);
  }
}

// Nueva función para procesar resultados con email
async function procesarResultadosConEmail() {
  const emailInput = document.getElementById("user-email");
  const emailDisplay = document.getElementById("user-email-display");
  
  if (emailInput && emailDisplay) {
    emailDisplay.textContent = `Usuario: ${emailInput.value}`;
    emailDisplay.style.display = "block";
  }
  
  // Guardar en la colección eneagrama con formato completo
  console.log("💾 Guardando en colección eneagrama...");
  try {
    // Guardar documento completo en colección eneagrama
    await guardarEnEneagrama(emailInput.value);
    console.log("✅ Documento guardado exitosamente en eneagrama");
  } catch (error) {
    console.error("❌ Error al guardar en eneagrama:", error);
    throw error;
  }
  
  // Ocultar formulario de email
  if (emailFormContainer) {
    emailFormContainer.style.display = "none";
  }
  
  // Mostrar mensaje de éxito
  showAlert("¡Perfecto! Procesando tus resultados...", "success");
  
  // Mostrar resultados después de un breve delay
  setTimeout(() => {
    hideAlert();
    mostrarResultadosFinales(window.calculatedScores);
  }, 1500);
}

// Función para obtener el tipo de integración (crecimiento)
function getIntegrationType(type) {
  const integrationMap = {
    1: 7, 2: 4, 3: 6, 4: 1, 5: 8, 6: 9, 7: 5, 8: 2, 9: 3
  };
  return integrationMap[type] || type;
}

// Función para obtener el tipo de desintegración (estrés)
function getDisintegrationType(type) {
  const disintegrationMap = {
    1: 4, 2: 8, 3: 9, 4: 2, 5: 7, 6: 3, 7: 1, 8: 5, 9: 6
  };
  return disintegrationMap[type] || type;
}

// Función para reiniciar el test
function restartTest() {
  if (confirm('¿Estás seguro de que quieres reiniciar el test? Perderás tus resultados actuales.')) {
    window.location.reload();
  }
}

// Función para compartir resultados
function shareResults() {
  const dominantType = window.calculatedScores ? window.calculatedScores.indexOf(Math.max(...window.calculatedScores)) + 1 : 1;
  const typeNames = ['El Perfeccionista', 'El Ayudador', 'El Triunfador', 'El Individualista', 'El Investigador', 'El Leal', 'El Entusiasta', 'El Desafiador', 'El Pacificador'];
  
  const shareText = `¡Acabo de completar el test de motivación Eneagrama! Mi tipo predominante es el Tipo ${dominantType} - ${typeNames[dominantType - 1]}. 🎯\n\nDescubre tu tipo en: ${window.location.href}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Mi Resultado del Test de Motivación Eneagrama',
      text: shareText,
      url: window.location.href
    });
  } else {
    // Fallback para navegadores que no soportan Web Share API
    navigator.clipboard.writeText(shareText).then(() => {
      alert('¡Resultados copiados al portapapeles! Puedes compartirlos en tus redes sociales.');
    }).catch(() => {
      alert('Comparte este enlace: ' + window.location.href);
    });
  }
}

// Función para manejar el formulario de contacto
function handleContactForm(event) {
  event.preventDefault();
  
  const whatsappInput = document.getElementById('whatsapp-input');
  const countryCodeSelect = document.getElementById('country-code');
  const formMessage = document.getElementById('form-message');
  const contactButton = document.querySelector('.contact-button');
  
  const whatsappNumber = whatsappInput.value.trim();
  const countryCode = countryCodeSelect ? countryCodeSelect.value : '+593';
  
  if (!whatsappNumber) {
    showFormMessage('Por favor, ingresa tu número de WhatsApp', 'error');
    return;
  }
  
  // Combinar código de país con el número
  const fullPhoneNumber = countryCode + whatsappNumber;
  
  // Validar formato básico de número (sin el +)
  const phoneRegex = /^[1-9][\d]{6,14}$/;
  if (!phoneRegex.test(whatsappNumber.replace(/\s/g, ''))) {
    showFormMessage('Por favor, ingresa un número de WhatsApp válido', 'error');
    return;
  }
  
  // Mostrar estado de carga
  contactButton.innerHTML = '<span>⏳ Enviando...</span>';
  contactButton.disabled = true;
  
  // Actualizar documento existente en colección eneagrama
  const db = firebase.firestore();
  
  // Buscar el documento más reciente del usuario por email
  const emailInput = document.getElementById('user-email');
  const userEmail = emailInput ? emailInput.value : '';
  
  if (!userEmail) {
    showFormMessage('Error: No se encontró el email del usuario', 'error');
    contactButton.innerHTML = '<span>📱 Enviar WhatsApp</span>';
    contactButton.disabled = false;
    return;
  }
  
  // Buscar el documento más reciente del usuario
  db.collection('eneagrama')
    .where('email', '==', userEmail)
    .orderBy('fecha_creacion', 'desc')
    .limit(1)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        throw new Error('No se encontró el documento del usuario');
      }
      
      // Obtener el documento más reciente
      const doc = querySnapshot.docs[0];
      
      // Actualizar el documento agregando el campo movil
      return doc.ref.update({
        movil: fullPhoneNumber,
        fecha_actualizacion: new Date().toLocaleString('es-ES', {
          timeZone: 'America/Guayaquil',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      });
    })
    .then(() => {
      console.log('✅ Número de WhatsApp actualizado en documento eneagrama');
      
      // Mostrar mensaje de éxito con ícono (persistente)
      showFormMessage('✅ ¡Guardado exitoso! Te contactaremos pronto por WhatsApp.', 'success', true);
      
      // Limpiar el input
      whatsappInput.value = '';
      
      // Bloquear el botón permanentemente y cambiar su apariencia
      contactButton.innerHTML = '<span>✅ Enviado</span>';
      contactButton.disabled = true;
      contactButton.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
      contactButton.style.cursor = 'not-allowed';
      contactButton.style.opacity = '0.8';
      
      // Deshabilitar el input también
      whatsappInput.disabled = true;
      whatsappInput.style.opacity = '0.6';
      whatsappInput.style.cursor = 'not-allowed';
      
      // Deshabilitar el selector de país
      const countrySelect = document.getElementById('country-code');
      if (countrySelect) {
        countrySelect.disabled = true;
        countrySelect.style.opacity = '0.6';
        countrySelect.style.cursor = 'not-allowed';
      }
    })
    .catch((error) => {
      console.error('Error al actualizar documento eneagrama:', error);
      showFormMessage('❌ Error al enviar. Intenta nuevamente.', 'error');
      
      // Restaurar el botón en caso de error
      contactButton.innerHTML = '<span>📱 Enviar WhatsApp</span>';
      contactButton.disabled = false;
      contactButton.style.background = 'linear-gradient(135deg, #25d366, #128c7e)';
      contactButton.style.cursor = 'pointer';
      contactButton.style.opacity = '1';
    });
}

// Función para mostrar mensajes del formulario
function showFormMessage(message, type, persistent = false) {
  const formMessage = document.getElementById('form-message');
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
  
  // Solo limpiar mensaje después de 5 segundos si no es persistente
  if (!persistent) {
    setTimeout(() => {
      formMessage.textContent = '';
      formMessage.className = 'form-message';
    }, 5000);
  }
}

// Función para convertir respuestas a formato JSON con p1, p2, etc.
function convertirRespuestasAFormatoJSON() {
  const respuestasJSON = {};
  userResponses.forEach((respuesta, index) => {
    respuestasJSON[`p${index + 1}`] = respuesta.toString();
  });
  return respuestasJSON;
}

// Función para guardar en la colección eneagrama
async function guardarEnEneagrama(email) {
  try {
    console.log("🔗 Conectando a Firebase...");
    const db = firebase.firestore();
    console.log("✅ Conexión a Firebase establecida");
    
    // Convertir respuestas al formato p1, p2, etc.
    const respuestasJSON = convertirRespuestasAFormatoJSON();
    
    // Calcular resultado
    const scores = calculateScores();
    const maxScore = Math.max(...scores);
    const dominantTypeIndex = scores.indexOf(maxScore);
    
    // Crear documento con la estructura completa
    const documentoEneagrama = {
      consentimiento: true,
      email: email,
      fecha_creacion: new Date().toLocaleString('es-ES', {
        timeZone: 'America/Guayaquil',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      respuestas: respuestasJSON,
      resultado: {
        descripcion: obtenerDescripcionTipo(dominantTypeIndex + 1),
        puntaje: maxScore,
        tipo: (dominantTypeIndex + 1).toString()
      },
      user_id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      version_test: "v1.0"
    };
    
    console.log("📊 Documento a guardar:", documentoEneagrama);
    
    // Guardar en la colección eneagrama
    await db.collection('eneagrama').add(documentoEneagrama);
    
    console.log('✅ Documento guardado en colección eneagrama');
    return true;
  } catch (error) {
    console.error('❌ Error al guardar en eneagrama:', error);
    throw error;
  }
}

// Función para actualizar resultado en Firestore
async function actualizarResultadoFirestore(resultado) {
  try {
    const db = firebase.firestore();
    
    const resultadoData = {
      ...resultado,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      scores: window.calculatedScores || []
    };
    
    await db.collection('test_resultados').add(resultadoData);
    console.log('✅ Resultado guardado en Firestore');
  } catch (error) {
    console.error('❌ Error al guardar resultado:', error);
    throw error;
  }
}

// Función para mostrar los resultados finales
function mostrarResultadosFinales(scores) {
  if (!resultsTextDiv || !resultsContainer) return;

  const loadingSpinner = wrapper.querySelector("#loading-spinner");
  loadingSpinner.style.display = "flex";
  resultsContainer.style.display = "none";

  // Mostrar spinner por más tiempo para mejor UX
  setTimeout(() => {
    loadingSpinner.style.display = "none";
    resultsContainer.style.display = "block";

    const maxScore = Math.max(...scores);
    const dominantTypeIndex = scores.indexOf(maxScore);
    const dominantType = dominantTypeIndex + 1;

    // Mensaje removido según solicitud del usuario
    
    // Calcular el tipo secundario (wing)
    const sortedScores = [...scores].map((score, index) => ({ score, index })).sort((a, b) => b.score - a.score);
    const secondaryTypeIndex = sortedScores[1].index;
    const secondaryType = secondaryTypeIndex + 1;
    
    resultsTextDiv.innerHTML = `
      <div class="results-header">
        <div class="results-icon-container">
          <img src="media/icon_enea.png" alt="Eneagrama" class="results-main-icon">
          </div>
        <h1 class="results-main-title">Tu Análisis de Motivación</h1>
        <p class="results-subtitle">Descubre tu esencia y potencial de crecimiento</p>
        </div>
      
      <div class="dominant-result">
        <div class="dominant-type-card" style="background: linear-gradient(135deg, ${typeColors[dominantTypeIndex]}20, ${typeColors[dominantTypeIndex]}10); border-left: 4px solid ${typeColors[dominantTypeIndex]};">
          <div class="type-header">
            <div class="type-icon" style="color: ${typeColors[dominantTypeIndex]};">${typeIcons[dominantTypeIndex]}</div>
            <div class="type-info">
              <div class="type-number" style="color: ${typeColors[dominantTypeIndex]};">Tipo ${dominantType} - ${typeLabels[dominantTypeIndex]}</div>
              <div class="type-score" style="color: ${typeColors[dominantTypeIndex]};">${scores[dominantTypeIndex]} puntos</div>
      </div>
          </div>
          <p class="dominant-description">Tu tipo de motivación predominante según el Eneagrama</p>
          ${scores[secondaryTypeIndex] > 0 ? `
            <div class="wing-info">
              <span class="wing-label">Tipo Secundario (Ala):</span>
              <span class="wing-type" style="color: ${typeColors[secondaryTypeIndex]};">Tipo ${secondaryType} - ${typeLabels[secondaryTypeIndex]}</span>
              <p class="wing-description">Este tipo complementa tu motivación principal y aporta características adicionales a tu forma de ser.</p>
            </div>
          ` : ''}
        </div>
      </div>
      
      <div class="all-results-section">
        <h3 class="section-title">Mapa Completo de Motivación</h3>
        <p class="section-description">Visualiza tus tendencias en los 9 tipos del Eneagrama</p>
        <div class="results-grid">
          ${scores.map((score, index) => `
            <div class="result-item ${index === dominantTypeIndex ? 'dominant' : ''}" style="border-left: 3px solid ${typeColors[index]};">
              <div class="result-header">
                <span class="result-type" style="color: ${typeColors[index]};">${typeIcons[index]} Tipo ${index + 1} - ${typeLabels[index]}</span>
                <span class="result-score" style="color: ${typeColors[index]};">${score}</span>
              </div>
              <div class="result-bar">
                <div class="result-progress" style="width: ${(score / Math.max(...scores)) * 100}%; background: ${typeColors[index]};"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="growth-section">
        <h3 class="section-title">Rutas de Crecimiento Personal</h3>
        <div class="growth-cards">
          <div class="growth-card integration" style="border-left: 4px solid ${typeColors[dominantTypeIndex]};">
            <h4 style="color: ${typeColors[dominantTypeIndex]};">🔄 Integración (Crecimiento)</h4>
            <p>Cuando estás en tu mejor momento, tiendes hacia las cualidades del <strong>Tipo ${getIntegrationType(dominantType)} - ${typeLabels[getIntegrationType(dominantType) - 1]}</strong></p>
          </div>
          <div class="growth-card disintegration" style="border-left: 4px solid #ef4444;">
            <h4 style="color: #ef4444;">⚠️ Desintegración (Estrés)</h4>
            <p>En momentos de estrés, puedes mostrar características del <strong>Tipo ${getDisintegrationType(dominantType)} - ${typeLabels[getDisintegrationType(dominantType) - 1]}</strong></p>
          </div>
        </div>
      </div>
      
      <div class="contact-section">
        <div class="contact-card">
          <h3 class="contact-title">¿Necesitas más información?</h3>
          <p class="contact-description">Si deseas mayor información sobre tu tipo de motivación, ayuda personalizada o coaching, déjanos tu WhatsApp y te contactaremos.</p>
          <form class="contact-form" id="contact-form">
            <div class="form-group">
              <div class="phone-input-container">
                <select id="country-code" class="country-select">
                  <option value="+593">🇪🇨 Ecuador (+593)</option>
                  <option value="+1">🇺🇸 Estados Unidos (+1)</option>
                  <option value="+52">🇲🇽 México (+52)</option>
                  <option value="+57">🇨🇴 Colombia (+57)</option>
                  <option value="+51">🇵🇪 Perú (+51)</option>
                  <option value="+56">🇨🇱 Chile (+56)</option>
                  <option value="+54">🇦🇷 Argentina (+54)</option>
                  <option value="+55">🇧🇷 Brasil (+55)</option>
                  <option value="+34">🇪🇸 España (+34)</option>
                  <option value="+49">🇩🇪 Alemania (+49)</option>
                  <option value="+33">🇫🇷 Francia (+33)</option>
                  <option value="+44">🇬🇧 Reino Unido (+44)</option>
                </select>
                <input type="tel" id="whatsapp-input" placeholder="Número de WhatsApp" required>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="contact-button">
                <span>📱 Enviar WhatsApp</span>
              </button>
            </div>
            <div class="form-message" id="form-message"></div>
          </form>
        </div>
      </div>
      
      <div class="cta-section">
        <div class="cta-card">
          <h3 class="cta-title">¿Quieres profundizar más?</h3>
          <p class="cta-description">Este es solo un resultado de muestra. El test completo con 180 preguntas te dará un análisis más preciso y detallado de tu motivación.</p>
          <div class="cta-buttons">
            <button class="cta-button primary" onclick="restartTest()">
              <span>🔄 Hacer Test Completo</span>
            </button>
            <button class="cta-button secondary" onclick="shareResults()">
              <span>📤 Compartir Resultados</span>
            </button>
          </div>
        </div>
      </div>
    `;

    if (typeDescriptions && typeDescriptions.length > 0) {
      typeDescriptions.forEach((desc) => (desc.style.display = "none"));

      const dominantTypeDesc = wrapper.querySelector(`#type-${dominantType}`);
      if (dominantTypeDesc) {
        dominantTypeDesc.style.display = "block";
        dominantTypeDesc.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      console.warn(
        "No se encontraron descripciones de tipos para mostrar/ocultar"
      );
    }
    
    // Agregar event listener al formulario de contacto
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', handleContactForm);
    }

    // Efecto de confetti mejorado
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'],
      shapes: ['circle', 'square'],
      scalar: 1.2
    });
    
    // Segundo confetti después de un delay
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 50,
        origin: { y: 0.4 },
        colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'],
        shapes: ['circle', 'square'],
        scalar: 0.8
      });
    }, 500);

    // Mensaje final diferente según el modo
    const finalMessage = `<p style="color:#43e97b;font-weight:bold;margin-top:15px;">
                ¡Qué lindo ser quien eres! ¡Celebra tu tipo de personalidad único! 🎉
            </p>
            <div class="final-message" style="margin-top:20px;font-size:1.1em;">
                Ahora que conoces tu tipo, aprovecha estas características únicas para seguir creciendo y desarrollándote. ¡El mundo necesita exactamente quién eres!
      </div>`;

    resultsTextDiv.innerHTML += finalMessage;

    resultsContainer.scrollIntoView({ behavior: "smooth" });
  }, 2500);
}

function drawChart(scores, dominantTypeIndex) {
  const chartCanvas = wrapper.querySelector("#results-chart");
  if (!chartCanvas) return;
  const chartCtx = chartCanvas.getContext("2d");
  if (resultsChart) resultsChart.destroy();

  // Crear colores con transparencia para mostrar todos los puntajes
  const backgroundColors = typeColors.map((color, index) => {
    if (scores[index] > 0) {
      return color + '80'; // 50% de opacidad para tipos con puntaje
    }
    return color + '20'; // 12% de opacidad para tipos sin puntaje
  });

  // Configuración del gráfico moderno 2025
  resultsChart = new Chart(chartCtx, {
    type: "polarArea",
    data: {
      labels: typeLabels,
      datasets: [
        {
          label: "Puntuación",
          data: scores,
          backgroundColor: backgroundColors,
          borderColor: typeColors,
          borderWidth: 2,
          borderAlign: "center",
          hoverBackgroundColor: typeColors,
          hoverBorderColor: "#FFFFFF",
          hoverBorderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 2000,
        easing: 'easeInOutQuart'
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
          cornerRadius: 12,
          padding: 12,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            title: function(context) {
              return context[0].label;
            },
            label: function(context) {
              return `Puntuación: ${context.parsed} puntos`;
            }
          }
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          suggestedMax: Math.max(...scores) * 1.2,
          pointLabels: {
            display: true,
            centerPointLabels: true,
            font: { 
              size: 16, 
              weight: "700",
              family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
            },
            color: '#1f2937',
            padding: 16
          },
          ticks: {
            display: false
          },
          grid: {
            circular: true,
            color: 'rgba(0, 0, 0, 0.1)',
            lineWidth: 2
          },
          angleLines: {
            color: 'rgba(0, 0, 0, 0.1)',
            lineWidth: 2
          }
        }
      },
      layout: {
        padding: {
          top: 40,
          bottom: 40,
          left: 40,
          right: 40
        }
      },
      elements: {
        arc: {
          borderWidth: 1,
          borderColor: "#FFFFFF",
        },
      },
    },
  });
}

// Función para mostrar mensaje de error en el formulario
function showFormError(message) {
  console.log("🚨 showFormError called with:", message);
  const errorMessageDiv = document.getElementById("form-error-message");
  const errorTextSpan = errorMessageDiv ? errorMessageDiv.querySelector(".error-text") : null;
  
  console.log("🔍 errorMessageDiv found:", !!errorMessageDiv);
  console.log("🔍 errorTextSpan found:", !!errorTextSpan);
  
  if (errorMessageDiv && errorTextSpan) {
    // Establecer el texto del mensaje
    errorTextSpan.textContent = message;
    
    // Forzar visibilidad con múltiples métodos - ARREGLAR OPACITY
    errorMessageDiv.style.display = "flex";
    errorMessageDiv.style.visibility = "visible";
    errorMessageDiv.style.opacity = "1";
    errorMessageDiv.style.position = "relative";
    errorMessageDiv.style.zIndex = "9999";
    errorMessageDiv.style.backgroundColor = "#fff8e1";
    errorMessageDiv.style.border = "3px solid #ff9800";
    errorMessageDiv.style.borderRadius = "12px";
    errorMessageDiv.style.padding = "1.2rem";
    errorMessageDiv.style.margin = "1rem 0";
    errorMessageDiv.style.color = "#e65100";
    errorMessageDiv.style.fontWeight = "700";
    errorMessageDiv.style.fontSize = "1rem";
    errorMessageDiv.style.boxShadow = "0 4px 20px rgba(255, 152, 0, 0.3)";
    errorMessageDiv.classList.add("show");
    
    // Remover cualquier estilo que pueda estar ocultando el elemento
    errorMessageDiv.removeAttribute("hidden");
    errorMessageDiv.removeAttribute("aria-hidden");
    
    console.log("✅ Error message should be visible now");
    console.log("📊 Computed styles:", {
      display: window.getComputedStyle(errorMessageDiv).display,
      visibility: window.getComputedStyle(errorMessageDiv).visibility,
      opacity: window.getComputedStyle(errorMessageDiv).opacity,
      position: window.getComputedStyle(errorMessageDiv).position,
      zIndex: window.getComputedStyle(errorMessageDiv).zIndex
    });
    
    // Scroll al mensaje de error
    setTimeout(() => {
      errorMessageDiv.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  } else {
    console.log("❌ Error: Could not find form-error-message elements");
  }
}

// Función para ocultar mensaje de error del formulario
function hideFormError() {
  const errorMessageDiv = document.getElementById("form-error-message");
  if (errorMessageDiv) {
    errorMessageDiv.style.display = "none";
    errorMessageDiv.style.visibility = "hidden";
    errorMessageDiv.style.opacity = "0";
    errorMessageDiv.classList.remove("show");
  }
  
  // También ocultar mensaje dinámico si existe
  const dynamicError = document.getElementById("dynamic-error-message");
  if (dynamicError) {
    dynamicError.remove();
  }
}

// Función para crear mensaje de error dinámico como respaldo
function createDynamicErrorMessage(message) {
  // Remover mensaje dinámico anterior si existe
  const existingDynamic = document.getElementById("dynamic-error-message");
  if (existingDynamic) {
    existingDynamic.remove();
  }
  
  // Crear nuevo mensaje de error dinámico
  const dynamicError = document.createElement("div");
  dynamicError.id = "dynamic-error-message";
  dynamicError.style.cssText = `
    background: #fff8e1;
    border: 3px solid #ff9800;
    border-radius: 12px;
    padding: 1.2rem;
    margin: 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #e65100;
    font-weight: 700;
    font-size: 1rem;
    line-height: 1.4;
    box-shadow: 0 4px 20px rgba(255, 152, 0, 0.3);
    position: relative;
    z-index: 9999;
    width: 100%;
    max-width: 100%;
    animation: slideDown 0.3s ease-out;
  `;
  
  dynamicError.innerHTML = `
    <span style="font-size: 1.2rem; flex-shrink: 0;">⚠️</span>
    <span>${message}</span>
  `;
  
  // Insertar antes de los botones
  const formButtons = document.querySelector(".form-buttons");
  if (formButtons) {
    formButtons.parentNode.insertBefore(dynamicError, formButtons);
    console.log("✅ Mensaje de error dinámico creado y mostrado");
    
    // Scroll al mensaje
    setTimeout(() => {
      dynamicError.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  } else {
    console.log("❌ No se pudo encontrar .form-buttons para insertar el mensaje");
  }
}

function showAlert(message, type = "error") {
  let icon, title, confirmButtonColor;
  
  switch (type) {
    case "error":
      icon = "error";
      title = "Error";
      confirmButtonColor = "#e74c3c";
      break;
    case "warning":
      icon = "warning";
      title = "Atención";
      confirmButtonColor = "#ff9800";
      break;
    case "success":
      icon = "success";
      title = "¡Perfecto!";
      confirmButtonColor = "#43e97b";
      break;
    default:
      icon = "info";
      title = "Información";
      confirmButtonColor = "#667eea";
  }
  
  Swal.fire({
    title: title,
    text: message,
    icon: icon,
    confirmButtonText: "Entendido",
    confirmButtonColor: confirmButtonColor,
    background: "#ffffff",
    color: "#2d3748",
    customClass: {
      popup: 'swal-popup-custom',
      title: 'swal-title-custom',
      content: 'swal-content-custom',
      confirmButton: 'swal-button-custom'
    },
    showClass: {
      popup: 'animate__animated animate__fadeInDown'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp'
    }
  });
}

function hideAlert() {
  // SweetAlert2 se cierra automáticamente, pero podemos forzar el cierre si es necesario
  if (Swal.isVisible()) {
    Swal.close();
  }
}

// Función para mostrar notificaciones de confirmación
function showConfirmation(title, text, confirmText = "Sí", cancelText = "No") {
  return Swal.fire({
    title: title,
    text: text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#43e97b",
    cancelButtonColor: "#e74c3c",
    background: "#ffffff",
    color: "#2d3748",
    customClass: {
      popup: 'swal-popup-custom',
      title: 'swal-title-custom',
      content: 'swal-content-custom',
      confirmButton: 'swal-button-custom',
      cancelButton: 'swal-button-custom'
    },
    showClass: {
      popup: 'animate__animated animate__fadeInDown'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp'
    }
  });
}

if (restartTestBtn) {
  restartTestBtn.addEventListener("click", () => {
    if (resultsContainer) resultsContainer.style.display = "none";
    if (startTestContainer) startTestContainer.style.display = "block";
    if (emailFormContainer) emailFormContainer.style.display = "none";

    if (typeDescriptions && typeDescriptions.length > 0) {
      typeDescriptions.forEach((desc) => (desc.style.display = "none"));
    }

    currentPage = 1;
    shuffledQuestions = [];
    userResponses = [];
    window.calculatedScores = null;
    if (resultsChart) {
      resultsChart.destroy();
      resultsChart = null;
    }
  });
} else {
  console.warn("Botón #restart-test-btn no encontrado.");
}

// Evento para iniciar test
if (startTestBtn) {
  startTestBtn.addEventListener("click", function () {
    // Test completo activado
    console.log('Modo configurado: Test Completo');
    initializeQuiz();
  });
} else {
  console.warn(
    "Botón 'start-test-btn' no encontrado. El test no se iniciará automáticamente."
  );
}

// Enviar formulario
if (quizForm) {
  quizForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("🚀 Iniciando envío del formulario...");
    console.log("📊 Modo: Test Completo");
    console.log("📝 Respuestas del usuario:", userResponses);
    console.log("❓ Total de preguntas:", shuffledQuestions.length);
    
    if (!areCurrentPageQuestionsAnswered()) {
      console.log("❌ Preguntas sin responder en la página actual");
      return;
    }
    
    const scores = calculateScores();
    console.log("🎯 Puntuaciones calculadas:", scores);
    
    if (scores) {
      // Guardar puntuaciones calculadas para uso posterior
      window.calculatedScores = scores;
      console.log("🎯 Puntuaciones calculadas y guardadas:", scores);
      
      // Mostrar formulario de email para obtener datos del usuario
        displayResults(scores);
      } else {
      console.log("❌ No se pudieron calcular las puntuaciones");
    }
  });
} else {
  console.error("Elemento quizForm no encontrado.");
}

// Event listener para el botón "Ver Mis Resultados" del formulario de email
document.addEventListener('DOMContentLoaded', function() {
  const submitEmailBtn = document.getElementById('submit-email-btn');
  if (submitEmailBtn) {
    submitEmailBtn.addEventListener('click', async function(event) {
      event.preventDefault();
      
      const emailInput = document.getElementById('user-email');
      const email = emailInput ? emailInput.value.trim() : '';
      
      if (!email) {
        alert('Por favor, ingresa tu email para continuar.');
        return;
      }
      
      // Validar formato de email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Por favor, ingresa un email válido.');
        return;
      }
      
      // Procesar resultados con email y guardar en Firebase
      try {
        await procesarResultadosConEmail();
        
        // Calcular y mostrar resultados
        const scores = calculateScores();
        if (scores) {
          displayResults(scores);
        }
      } catch (error) {
        console.error("❌ Error al procesar resultados:", error);
        alert("Error al procesar los resultados. Intenta nuevamente.");
      }
    });
  }
});

// Devuelve la descripción del tipo (puedes personalizar)
function obtenerDescripcionTipo(tipo) {
  const descripciones = {
    1: "El perfeccionista",
    2: "El ayudador",
    3: "El triunfador",
    4: "El individualista",
    5: "El investigador",
    6: "El leal",
    7: "El entusiasta",
    8: "El desafiador",
    9: "El pacificador",
  };
  return descripciones[tipo] || "";
}
