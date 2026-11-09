import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
// Cambiado: ruta relativa en vez de src/... para que el import funcione siempre
import { Granja } from "../../granja/entities/granja.entity";

@Entity({ name: "COSECHA" })
export class Cosecha {
  @PrimaryGeneratedColumn({ name: "ID" })
  id!: number;

  @Column({ name: "NOMBRE", type: "varchar", length: 120 })
  nombre!: string;

  @Column({ name: "KILOS", type: "integer" })
  kilos!: number;

  @ManyToOne(() => Granja, (granja) => granja.cosechas, { nullable: false })

  @JoinColumn({ name: "ID_GRANJA" })

  granja!: Granja;
}