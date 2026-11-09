import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Granja } from "../granja/entities/granja.entity";
import { Cosecha } from "./entities/cosecha.entity";

@Injectable()
export class CosechaService {
  constructor(
    @InjectRepository(Cosecha)
    private readonly cosechaRepository: Repository<Cosecha>,
    // Añadido: Repository de Granja para que funcione el resumen por granja
    @InjectRepository(Granja)
    private readonly granjaRepository: Repository<Granja>,
  ) {}

  findAll() {
    return this.cosechaRepository
      .createQueryBuilder("registro")
      .innerJoinAndSelect("registro.granja", "principal")
      .orderBy("registro.id", "ASC")
      .getMany();
  }

  findByGranja(principalId: number) {
    return this.cosechaRepository
      .createQueryBuilder("registro")
      .innerJoinAndSelect("registro.granja", "principal")
      .where("principal.id = :principalId", { principalId })
      .orderBy("registro.id", "ASC")
      .getMany();
  }

  findByNombre(text: string) {
    return this.cosechaRepository
      .createQueryBuilder("registro")
      .innerJoinAndSelect("registro.granja", "principal")
      .where("registro.nombre ILIKE :pattern", { pattern: `%${text}%` })
      .orderBy("registro.id", "ASC")
      .getMany();
  }

  findByGranjaAndMinimo(principalId: number, minimum: number) {
    return this.cosechaRepository
      .createQueryBuilder("registro")
      .innerJoinAndSelect("registro.granja", "principal")
      .where("principal.id = :principalId", { principalId })
      .andWhere("registro.kilos >= :minimum", { minimum })
      .orderBy("registro.kilos", "DESC")
      .getMany();
  }

  // Corregido: ahora parte del Repository de Granja, porque la relación cosechas está en Granja
  countByGranja() {
    return this.granjaRepository
      .createQueryBuilder("principal")
      .leftJoin("principal.cosechas", "registro")
      .select("principal.id", "id")
      .addSelect("principal.nombre", "nombre")
      .addSelect("COUNT(registro.id)", "total")
      .groupBy("principal.id")
      .addGroupBy("principal.nombre")
      .orderBy("principal.id", "ASC")
      .getRawMany();
  }

  // Añadido: INNER JOIN con GRANJA y WHERE sobre el nombre de la granja, que es una columna de la otra tabla
  findByNombreGranja(nombre: string) {
    return this.cosechaRepository
      .createQueryBuilder("registro")
      .innerJoinAndSelect("registro.granja", "principal")
      .where("principal.nombre ILIKE :nombre", { nombre: `%${nombre}%` })
      .orderBy("registro.id", "ASC")
      .getMany();
  }

  // Añadido: inserta una cosecha y la enlaza con su granja mediante la FK
  crear(data: { nombre: string; kilos: number; granja: { id: number } }) {
    return this.cosechaRepository
      .createQueryBuilder()
      .insert()
      .into(Cosecha)
      .values({
        nombre: data.nombre,
        kilos: data.kilos,
        granja: { id: data.granja.id },
      })
      .returning(["id"])
      .execute();
  }

  // Añadido: cambia nombre o kilos; el campo que no se envía no se modifica
  async modificar(id: number, data: { nombre?: string; kilos?: number }) {
    const result = await this.cosechaRepository
      .createQueryBuilder()
      .update(Cosecha)
      .set({ nombre: data.nombre, kilos: data.kilos })
      .where('"ID" = :id', { id })
      .execute();
    if (!result.affected) throw new NotFoundException(`No existe la cosecha ${id}`);
    return result;
  }

  // Añadido: borra una cosecha por su ID
  async eliminar(id: number) {
    const result = await this.cosechaRepository
      .createQueryBuilder()
      .delete()
      .from(Cosecha)
      .where('"ID" = :id', { id })
      .execute();
    if (!result.affected) throw new NotFoundException(`No existe la cosecha ${id}`);
    return result;
  }

  // Añadido: modifica la clave foránea ID_GRANJA para pasar la cosecha a otra granja
  // Comprueba antes que la granja destino existe, para responder 404 en vez de un 500 por la FK
  async cambiarGranja(id: number, principalId: number) {
    const existe = await this.granjaRepository.existsBy({ id: principalId });
    if (!existe) throw new NotFoundException(`No existe la granja ${principalId}`);
    const result = await this.cosechaRepository
      .createQueryBuilder()
      .update(Cosecha)
      .set({ granja: { id: principalId } })
      .where('"ID" = :id', { id })
      .execute();
    if (!result.affected) throw new NotFoundException(`No existe la cosecha ${id}`);
    return result;
  }
}
