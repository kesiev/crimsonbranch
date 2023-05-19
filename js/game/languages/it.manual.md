# Dungeons of Crimsonbranch
Troverai quello che ti serve per giocare e molto altro sulla [homepage del progetto]({{gamePlayUrl}}).

## Preparazione
 - Compila le celle _Statistiche_ come spiegato dall'intestazione
 - Metti una pedina da parte: l'eroe è ora fuori dal labirinto
 - Tieni 2 dadi e un po' di segnalini da parte
 - Dai un'occhiata alle **Regole Generali** alla fine di questo manuale
 - Vai alla **fase ESPLORAZIONE**

## Come si gioca

### Fase ESPLORAZIONE
 1. Svuota la sezione _Nemici_ e metti da parte i 2 dadi e tutti i segnalini
 2. Se hai delle celle piene nella sezione _Ogg._ puoi RIEQUIPAGGIARE quegli oggetti
 3. Controlla se nell'albero c'é almeno un simbolo {glyph pearl} senza alcun segno sopra
     - Se si: vai al passaggio successivo
     - Altrimenti: puoi decidere di sfidare Il Grande Male, segnare la casella vuota più in alto della sezione _Tempo_ se disponibile e saltare al passaggio 9 considerando l'intero albero
 4. Scegli il prossimo nodo da visitare:
     - Se la pedina è fuori dall'albero, su un nodo {glyph stairs} o un nodo {glyph door}: puoi scegliere un nodo {glyph door}
     - Se la pedina è su qualsiasi altra cella: puoi scegliere un qualsiasi nodo connesso
 5. Muovi la pedina sul nodo selezionato
 6. Segna la casella vuota più in alto della sezione _Tempo_ se disponibile
 7. Cerca la piccola griglia nel segmento più in basso della sezione _Tempo_ con almeno una casella segnata
 8. Usando la pedina come angolo in alto a sinistra, considera i nodi all'interno della griglia. Non considerare i nodi che cadono al di fuori dell'albero
 9. Cerca nell'area considerata le regioni di nodi ortogonalmente adiancenti tra loro con gli stessi simboli {glyph attack}, {glyph range}, {glyph defense} e {glyph heal}. Ignora i rami e le regioni possono sovrapporsi
 10. Per ogni regione che contiene almeno un nodo con un singolo simbolo valido:
     - Scegli un blocco vuoto della sezione _Nemici_
     - Segna la casella corrispondente al simbolo di quella regione
     - Scrivi il numero di nodi che compongono quella regione nelle celle _PV_ e _Potenza_
 11. Somma la _Potenza_ di tutti i nemici {glyph defense} e scrivi quel numero nelle celle _Scudo_ di tutti i nemici non-{glyph defense}. Lasciali vuoti se la somma è 0
 12. Vai alla **fase PREPARAZIONE**

### Fase PREPARAZIONE
 1. Tira il primo dado e mettilo sotto lo spazio _Neutrale_. E' il dado attivo
 2. Puoi decidere di passare alla **fase COMBATTIMENTO**
 3. Scegli il prossimo nodo da attivare
    - Se non ci sono segnalini sull'albero: puoi scegliere solo tra i nodi {glyph door}
    - Altrimenti: puoi scegliere qualsiasi nodo senza segnalino connesso ad un nodo con segnalino tramite un ramo segnato
 4. Attiva il nodo
    - Devi attivare almeno 1 simbolo valido di quel nodo:
      - {glyph defense}/{glyph attack}/{glyph range}/{glyph heal}:
        - Se il dado attivo si trova sotto lo spazio corrispondente: aumenta il valore del dado di 1
        - Altrimenti: muovi il dado attivo sotto lo spazio corrispondente
      - {glyph special}:
        - Se c'é un dado 6 sotto gli spazi {glyph defense}/{glyph attack}/{glyph range}/{glyph heal}: segui le istruzioni di quello spazio e metti il dado 6 da parte
        - Altrimenti: non fare nulla
    - Metti un segnalino su quel nodo
 5. Se il dado attivo è 6 e non si trova sotto lo spazio _Neutrale_:
    - Se c'é un altro dado da parte: tiralo e mettilo sotto lo spazio _Neutrale_. E' il nuovo dado attivo
    - Altrimenti: vai alla **fase COMBATTIMENTO**
 6. Torna al passaggio 2

### Fase COMBATTIMENTO
 1. Metti da parte il dado nello spazio _Neutrale_ se presente
 2. Puoi decidere di passare alla **Fase NEMICI**
 3. I nemici con un numero nella loro cella _PV_ sono vivi
 4. Scegli un nemico vivo:
    - Se è presente un numero nella sua cella _Scudo_:
      - Scegli uno spazio {glyph attack} o {glyph range} e diminuisci il valore dei dadi di quel numero
      - Svuota la cella _Scudo_
    - Altrimenti:
      - Nemico {glyph attack}: riduci il valore dei dadi sotto lo spazio {glyph attack} di 1 o sotto lo spazio {glyph range} di 2 per ridurre il valore della sua cella _PV_ di 1
      - Nemico {glyph range}: riduci il valore dei dadi sotto lo spazio {glyph range} di 1 o sotto lo spazio {glyph attack} di 2 per ridurre il valore della sua cella _PV_ di 1
      - Nemico {glyph heal}/{glyph defense}: scegli lo spazio {glyph attack} o {glyph range} e riduci il valore dei suoi dadi di 1 per ridurre il valore della cella _PV_ del nemico di 1
 5. Quando la cella _PV_ di un nemico raggiunge lo 0 lascialo vuoto
 6. Torna allo passaggio 2

### Fase NEMICI
 1. Somma la _Potenza_ di tutti i nemici vivi
 2. Sottrai il valore dei dadi sotto lo spazio {glyph defense}
 3. Cerca il valore nella cella _PV_ nella sezione _Statistiche_ e riducine il numero di quel valore
    - Se è minore o uguale a 0: copia il valore _PV/PE Max_ nella cella _PV_, metti la pedina da parte e vai alla **Fase ESPLORAZIONE**
    - Altrimenti: somma il valore dei dadi sotto lo spazio {glyph heal}, limitalo al valore di _PV/PE Max_ e sostituisci il numero nella cella _PV_
 4. Somma la _Potenza_ di tutti i nemici {glyph defense} vivi e scrivi il numero nelle celle _Scudo_ dei nemici non-{glyph defense} vivi. Lascialo vuoto se la somma è 0
 5. Somma la _Potenza_ di tutti i nemici {glyph heal} vivi e somma quel valore ai _PV_ dei nemici vivi, limitandolo al rispettivo valore _Potenza_
 6. Metti da parte tutti i dadi
 7. Conta i nemici vivi
    - Se ne è rimasto almeno 1: torna alla **fase PREPARAZIONE**
    - Altrimenti: vai alla **fase RACCOLTA**
  
### Fase RACCOLTA
 1. Se hai delle celle piene nella sezione _Ogg._, puoi RIEQUIPAGGIARE quegli oggetti
 2. Se la pedina si trova su un nodo con un simbolo {glyph pearl} senza alcun segno sopra puoi:
    - Barrarlo e aumentare il valore della cella _PE_ nella sezione _Statistiche_ del numero di nodi considerati per questa battaglia
    - Copiarci sopra qualsiasi simbolo {glyph defense}/{glyph attack}/{glyph range}/{glyph heal} nei nodi considerati in questa battaglia
 3. Se c'é un valore _Potenza_ riempito nello spazio _Nemici_ puoi cancellarlo e:
    - Aumentare il valore _PE_ nella sezione _Statistiche_ del valore _Potenza_
    - EQUIPAGGIARE un oggetto del _Tipo_ corrispondente al nemico (vedi la mappa _da_ nelle sezioni _Ogg._) e di _Qualità_ pari alla _Potenza_ del nemico
 4. Controlla se puoi fare qualcosa:
    - Se si: torna al passaggio 1
    - Se no:
      - Se hai sfidato Il Grande Male: **hai vinto!** Somma il numero di caselle vuote nella sezione _Tempo_ e le caselle grandi nella sezione _Livello/Punti abilità_ per ottenere il tuo punteggio finale
      - Altrimenti: torna alla **Fase ESPLORAZIONE**

## Regole Generali

### Nuovo livello
 - Se la cella _PE_ della sezione _Statistiche_ ha un valore uguale o superiore al valore _PV/PE Max_: segui le istruzioni nell'intestazione _Livello/Punti abilità_ per guadagnare un nuovo livello
 - In ogni momento, se nella sezione _Livello/Punti abilità_ hai almeno una casella piccola a sinistra di una casella grande barrata: puoi spuntarla per barrare qualsiasi ramo connesso a un nodo {glyph door} o che connetta qualsiasi altro nodo già connesso da un altro ramo barrato
  
### EQUIPAGGIARE un oggetto
 1. Tira 2 dadi. Questi sono i valori del _Dado 1_ e del _Dado 2_
 2. Cerca la piccola griglia nella sezione _Tempo_ nel segmento che corrisponde alla _Qualità_ dell'oggetto
 3. Usando i valori del _Dado 1_ e del _Dado 2_ in entrabi gli ordini come coordinata della casella in alto a sinistra, considera tutti i nodi che cadono all'interno delle due griglie. Non considerare i nodi che cadono al di fuori dell'albero
 4. Puoi:
    - Scartare l'oggetto: aumenta di 1 il valore nella cella _PE_ della sezione _Statistiche_
    - Se c'é almeno un ramo senza alcun segno dello stesso _Tipo_ dell'oggetto che connetta 2 nodi all'interno dell'area considerata: cerchia quel ramo, cancella qualsiasi altro cerchio disegnato su un ramo dello stesso _Tipo_ e sostituisci i valori _Dado 1_, _Dado 2_ e _Qualità_ nella relativa sezione _Ogg._ dello stesso tipo.
 
### RIEQUIPAGGIARE un oggetto
 - Segui la procedura EQUIPAGGIARE dal passaggio 2, usando come valori _Dado 1_ e _Dado 2_ quelli nelle celle invece che tirando i dadi
 - Durante il passaggio 4: se decidi di scartare l'oggetto dovrai anche cancellare qualsiasi cerchio sui rami del _Tipo_ dell'oggetto e tutte le celle della relativa sezione _Ogg._
