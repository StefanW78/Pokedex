const typeIcons = {
  fire: `<svg class="fire" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C12 2 9 10 12 14C15 18 12 22 12 22C12 22 18 16 12 2Z" fill="white"/>
        </svg>`,
  water: `<svg class="water" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8 8 6 12 12 22C18 12 16 8 12 2Z" fill="white"/>
          </svg>`,
  grass: `<svg class="grass" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C10 6 8 12 12 22C16 12 14 6 12 2Z" fill="white"/>
          </svg>`,
  bug: `<svg class="bug" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="5" stroke="white" stroke-width="1.5" fill="none"/>
          <line x1="12" y1="7" x2="12" y2="17" stroke="white" stroke-width="1.5"/>
          <line x1="7" y1="12" x2="17" y2="12" stroke="white" stroke-width="1.5"/>
        </svg>`,
  normal: `<svg class="normal" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="white" opacity="0.1"/>
            <circle cx="8" cy="10" r="1.5" fill="white"/>
            <circle cx="16" cy="10" r="1.5" fill="white"/>
            <path d="M8 16c1.333 1 3.667 1 5 0" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          </svg>`,
  electric: `<svg class="electric" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
               <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="white"/>
             </svg>`,
  psychic: `<svg class="psychic" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="white" stroke-width="1.5" fill="none"/>
              <circle cx="12" cy="12" r="5" fill="white"/>
            </svg>`,
  ice: `<svg class="ice" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
         <line x1="12" y1="2" x2="12" y2="22" stroke="white" stroke-width="1.5"/>
         <line x1="2" y1="12" x2="22" y2="12" stroke="white" stroke-width="1.5"/>
         <line x1="4" y1="4" x2="20" y2="20" stroke="white" stroke-width="1"/>
         <line x1="20" y1="4" x2="4" y2="20" stroke="white" stroke-width="1"/>
       </svg>`,
  fighting: `<svg class="fighting" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
               <circle cx="12" cy="12" r="10" stroke="white" stroke-width="1.5" fill="none"/>
               <path d="M12 6 L12 18 M6 12 L18 12" stroke="white" stroke-width="1.5"/>
             </svg>`,
  poison: `<svg class="poison" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 2 C8 8 6 12 12 22 C18 12 16 8 12 2 Z" stroke="white" stroke-width="1.5" fill="none"/>
             <circle cx="12" cy="12" r="3" fill="white"/>
           </svg>`,
  ground: `<svg class="ground" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
             <rect x="2" y="12" width="20" height="10" fill="white" opacity="0.3"/>
             <path d="M2 12 Q12 2 22 12" stroke="white" stroke-width="1.5" fill="none"/>
           </svg>`,
  flying: `<svg class="flying" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
             <path d="M2 12 L12 2 L22 12 L12 22 Z" stroke="white" stroke-width="1.5" fill="none"/>
           </svg>`,
  rock: `<svg class="rock" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
           <polygon points="12,2 2,12 12,22 22,12" stroke="white" stroke-width="1.5" fill="none"/>
         </svg>`,
  ghost: `<svg class="ghost" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2 C8 2 4 6 4 12 C4 18 8 22 12 22 C16 22 20 18 20 12 C20 6 16 2 12 2 Z" stroke="white" stroke-width="1.5" fill="none"/>
            <circle cx="9" cy="10" r="1.5" fill="white"/>
            <circle cx="15" cy="10" r="1.5" fill="white"/>
          </svg>`,
  dragon: `<svg class="dragon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
             <path d="M2 12 Q12 2 22 12 Q12 22 2 12 Z" stroke="white" stroke-width="1.5" fill="none"/>
           </svg>`,
  dark: `<svg class="dark" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
           <circle cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="1.5"/>
           <path d="M6 12 L12 6 L18 12 L12 18 Z" fill="white"/>
         </svg>`,
  steel: `<svg class="steel" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="16" height="16" stroke="white" stroke-width="1.5" fill="none"/>
            <line x1="4" y1="4" x2="20" y2="20" stroke="white" stroke-width="1.5"/>
          </svg>`,
  fairy: `<svg class="fairy" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="6" cy="6" r="3" fill="white"/>
            <circle cx="18" cy="6" r="3" fill="white"/>
            <circle cx="12" cy="18" r="3" fill="white"/>
          </svg>`,
};
