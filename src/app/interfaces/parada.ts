import { Markerlabel } from "./markerlabel";

export interface Parada {

    Latitude: number;
    Longitude: number;
    Title: string;
    RotaID: string;
    Bairro: string;
    Logradouro: string;
    marker?: google.maps.Marker;
    Usuario: string;
}
