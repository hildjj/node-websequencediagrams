export = WSD;
/**
 * API for WebSequenceDiagrams.
 *
 * @see https://www.websequencediagrams.com/embedding.html
 */
declare class WSD {
    /**
     * Get the URL for a given diagram.
     *
     * @param {string|Buffer} message The diagram description.
     * @param {string} [style='default'] Style of the diagram.  Valid styles
     *   include: 'default', 'earth', 'modern-blue', 'mscgen', 'omegapple',
     *   'qsd', 'rose', 'roundgreen', 'napkin', 'magazine', 'vs2010', or
     *   'patent'.
     * @param {string} [format='png'] Format for the output.  Valid output
     *   formats include: 'png', 'svg', or 'pdf'.  'pdf' requires a paid
     *   account.
     * @param {string} [apikey] API key for non-free usage.
     * @param {string} [root='https://www.websequencediagrams.com'] Root URL for
     *   the service.
     * @returns {Promise<string>} The URL for the diagram.
     */
    static diagramURL(message: string | Buffer, style?: string, format?: string, apikey?: string, root?: string): Promise<string>;
    /**
     * Retrieve a diagram.
     *
     * @param {string} description The diagram description.
     * @param {string} [style='default'] Style of the diagram.  Valid styles
     *   include: 'default', 'earth', 'modern-blue', 'mscgen', 'omegapple',
     *   'qsd', 'rose', 'roundgreen', 'napkin', 'magazine', 'vs2010', or
     *   'patent'.
     * @param {string} [format='png'] Format for the output.  Valid output
     *   formats include: 'png', 'svg', or 'pdf'.  'pdf' requires a paid
     *   account.
     * @param {string} [apikey] API key for non-free usage.
     * @param {string} [root] Root URL for the service.
     * @returns {Promise<[Buffer, string]>} Array with the contents of the
     *   diagram as the first item and the MIME type of the response as the
     *   second item.
     */
    static diagram(description: string, style?: string, format?: string, apikey?: string, root?: string): Promise<[Buffer, string]>;
}
declare namespace WSD {
    export { styles };
}
import { Buffer } from "buffer";
declare const styles: string[];
