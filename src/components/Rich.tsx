/**
 * Rend les **passages en gras** d'un texte traduit.
 * L'ordre des mots change d'une langue à l'autre : on ne peut pas découper
 * ces phrases en morceaux fixes, donc le gras voyage avec la traduction.
 */
export default function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 === 1 ? <b key={i}>{part}</b> : <span key={i}>{part}</span>
      )}
    </>
  );
}
