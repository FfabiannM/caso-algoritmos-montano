# ¿Se puede modelar en grafos?

Como tal sería posible modelarlo como un grafo, pero puede que no convenga para reemplazar todo el motor ya definido (Hash + Arbol AVL). El grafo aportaría valor real si ampliamos el problema a lo geográfico.

### ¿Como podría aplicarse? - En caso de ser un grafo ponderado de zonas (así el grafo sí aportaría valor real)

- Nodos: Cada zona o barrio (Cala Cala, Norte, Sarco, Tiquipaya, etc).
- Aristas: Conectan zonas que son vecinas o tienen acceso vial directo. El peso de cada arista es la distancia de kilómetros o el tiempo promedio de traslado en minutos.
- Para qué sirve (Algoritmo de Dijkstra / BFS): Si un cliente busca una casa en Cala Cala con un presupuesto bajo y no hay resultados, el sistema recorre el grafo hacia los nodos vecinos con menor peso (Queru Queru o Sarco) para recomendarle propiedades similares a pocos minutos de distancia. (Una sugerencia de internet)

---

Aunque de otra forma se pueda dibujar aristas entre 48k inmuebles y unas 140k busquedas, primero se tiene que haber resuelto el filtro de precios. Si se intenta armar el grafo comparando todos contra todos, se vuelve al coste cuadrático $O(N x M)$. Por ello el grafo sirve más para visualizar o analizar conexiones ya calculadas, pero no para filtrar rangos desde cero.
