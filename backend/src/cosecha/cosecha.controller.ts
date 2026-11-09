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

  @Get("por-granja")
  findByNombreGranja(@Query("nombre") nombre: string) {
    return this.cosechaService.findByNombreGranja(nombre);
  }

  @Post()
  crear(@Body() body: { nombre: string; kilos: number; granja: { id: number } }) {
    return this.cosechaService.crear(body);
  }

  @Patch(":id")
  modificar(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { nombre?: string; kilos?: number },
  ) {
    return this.cosechaService.modificar(id, body);
  }

  @Delete(":id")
  eliminar(@Param("id", ParseIntPipe) id: number) {
    return this.cosechaService.eliminar(id);
  }

  @Patch(":id/granja")
  cambiarGranja(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { principalId: number },
  ) {
    return this.cosechaService.cambiarGranja(id, body.principalId);
  }
}
