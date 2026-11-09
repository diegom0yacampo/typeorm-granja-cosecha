import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from "@nestjs/common";
import { CosechaService } from "./cosecha.service";

@Controller("cosechas")
export class CosechaController {
  constructor(private readonly cosechaService: CosechaService) {}

  @Get()
  findAll() {
    return this.cosechaService.findAll();
  }

  @Get("granja/:principalId")
  findByGranja(@Param("principalId") principalId: string) {
    return this.cosechaService.findByGranja(Number(principalId));
  }

  @Get("buscar")
  searchByName(@Query("texto") text: string) {
    return this.cosechaService.findByNombre(text);
  }

  @Get("granja/:principalId/minimo/:minimum")
  findByGranjaAndMinimum(
    @Param("principalId") principalId: string,
    @Param("minimum") minimum: string,
  ) {
    return this.cosechaService.findByGranjaAndMinimo(Number(principalId), Number(minimum));
  }

  @Get("resumen/granja")
  countByGranja() {
    return this.cosechaService.countByGranja();
  }

  // Añadido: GET /cosechas/por-granja?nombre=... lista las cosechas de las granjas con ese nombre
  @Get("por-granja")
  findByNombreGranja(@Query("nombre") nombre: string) {
    return this.cosechaService.findByNombreGranja(nombre);
  }

  // Añadido: POST /cosechas añade una cosecha, que luego se lista con GET /cosechas
  @Post()
  crear(@Body() body: { nombre: string; kilos: number; granja: { id: number } }) {
    return this.cosechaService.crear(body);
  }

  // Añadido: PATCH /cosechas/:id modifica un campo de la cosecha
  @Patch(":id")
  modificar(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { nombre?: string; kilos?: number },
  ) {
    return this.cosechaService.modificar(id, body);
  }

  // Añadido: DELETE /cosechas/:id elimina una cosecha
  @Delete(":id")
  eliminar(@Param("id", ParseIntPipe) id: number) {
    return this.cosechaService.eliminar(id);
  }

  // Añadido: PATCH /cosechas/:id/granja modifica la clave foránea
  @Patch(":id/granja")
  cambiarGranja(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { principalId: number },
  ) {
    return this.cosechaService.cambiarGranja(id, body.principalId);
  }
}
