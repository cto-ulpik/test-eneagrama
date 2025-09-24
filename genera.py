for tipo in range(1, 10):
    indices = [str(i) for i in range(tipo, 181, 9)]  # Si tus preguntas siguen el patrón p1, p10, ..., p172
    sum_formula = " + ".join([f"CAST(p{idx} AS INT64)" for idx in indices])
    print(f"({sum_formula}) / 20 AS tipo{tipo}_promedio,")