export class Hero {
  private constructor(
    readonly id: number,
    readonly name: string,
    readonly localizedName: string,
    readonly primaryAttr: string,
    readonly attackType: string,
    readonly roles: string[],
    readonly img: string,
    readonly icon: string,
    readonly baseHealth: number,
    readonly baseMana: number,
    readonly baseStr: number,
    readonly baseAgi: number,
    readonly baseInt: number,
  ) {}

  static create(props: {
    id: number;
    name: string;
    localized_name: string;
    primary_attr: string;
    attack_type: string;
    roles: string[];
    img: string;
    icon: string;
    base_health: number;
    base_mana: number;
    base_str: number;
    base_agi: number;
    base_int: number;
  }): Hero {
    return new Hero(
      props.id,
      props.name,
      props.localized_name,
      props.primary_attr,
      props.attack_type,
      props.roles,
      props.img,
      props.icon,
      props.base_health,
      props.base_mana,
      props.base_str,
      props.base_agi,
      props.base_int
    );
  }

  // Método para converter o objeto Hero em um objeto plano para passagem entre servidor e cliente
  toJSON(): HeroDTO {
    return {
      id: this.id,
      name: this.name,
      localized_name: this.localizedName,
      primary_attr: this.primaryAttr,
      attack_type: this.attackType,
      roles: this.roles,
      img: this.img,
      icon: this.icon,
      base_health: this.baseHealth,
      base_mana: this.baseMana,
      base_str: this.baseStr,
      base_agi: this.baseAgi,
      base_int: this.baseInt,
    };
  }
}

// DTO para transferência de dados entre servidor e cliente
export interface HeroDTO {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
  img: string;
  icon: string;
  base_health: number;
  base_mana: number;
  base_str: number;
  base_agi: number;
  base_int: number;
}